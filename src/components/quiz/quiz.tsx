import { useState } from 'react'
import './quiz.css'

export type QuizAnswers = {
  industry: 'nonprofit' | 'public' | 'private' | null
  administrators: number
  reviewers: number
  averageSalary: number
  launchTimeMonths: number
  totalEmployees: string
  firstName: string
  lastName: string
  workEmail: string
  companyName: string
  phone: string
}

const INDUSTRIES = [
  { id: 'nonprofit' as const, label: 'Nonprofit Sector' },
  { id: 'public' as const, label: 'Public Sector' },
  { id: 'private' as const, label: 'Private Sector' },
]

const defaultAnswers: QuizAnswers = {
  industry: 'nonprofit',
  administrators: 0,
  reviewers: 0,
  averageSalary: 10000,
  launchTimeMonths: 1,
  totalEmployees: '',
  firstName: '',
  lastName: '',
  workEmail: '',
  companyName: '',
  phone: '',
}

function roundToNearest5(x: number): number {
  return Math.round(x / 5) * 5
}

/* Slider: 1=<1mo, 2=1mo, 3=2mo, 4=3mo, 5=4mo, 6=5mo, 7=6mo+ */
const LAUNCH_WEEKS: Record<string, Record<number, number>> = {
  nonprofit: { 1: 0, 2: 1, 3: 4, 4: 8, 5: 12, 6: 16, 7: 20 },
  public: { 1: 0, 2: 0.4, 3: 4, 4: 8, 5: 12, 6: 16, 7: 20 },
  private: { 1: 0, 2: 1, 3: 5, 4: 9, 5: 13, 6: 17, 7: 21 },
}

function computeResults(answers: QuizAnswers) {
  const industry = answers.industry ?? 'nonprofit'
  const launchKey = Math.min(Math.max(answers.launchTimeMonths, 1), 7) as 1 | 2 | 3 | 4 | 5 | 6 | 7
  const weeksMap = LAUNCH_WEEKS[industry] ?? LAUNCH_WEEKS.nonprofit
  const launchWeeksFaster = weeksMap[launchKey] ?? 0
  const displayWeeks = launchWeeksFaster

  if (industry === 'nonprofit') {
    const adminHours = Math.floor(answers.administrators * 3.46)
    const savedPerYear = Math.round(answers.averageSalary * 0.2645)
    const reviewerHours = Math.floor(answers.reviewers * 2.4)
    return {
      adminHoursPerWeek: adminHours,
      reviewerHoursPerWeek: reviewerHours,
      savedPerYear,
      savedPerYearLabel: 'Save',
      launchWeeksFaster: displayWeeks,
      retentionPerYear: null as number | null,
    }
  }

  if (industry === 'public') {
    const adminHours = Math.floor(answers.administrators * 3.56)
    const savedPerYear = roundToNearest5(answers.averageSalary * 1.98163)
    const reviewerHours = Math.floor(answers.reviewers * 3.71)
    return {
      adminHoursPerWeek: adminHours,
      reviewerHoursPerWeek: reviewerHours,
      savedPerYear,
      savedPerYearLabel: 'Save',
      launchWeeksFaster: displayWeeks,
      retentionPerYear: null as number | null,
    }
  }

  if (industry === 'private') {
    const adminHours = Math.floor(answers.administrators * 3.2)
    const savedPerProgram = roundToNearest5(
      answers.administrators * answers.averageSalary * 0.1717286858
    )
    const reviewerHours = Math.floor(answers.reviewers * 3.71)
    const employees = parseInt(answers.totalEmployees, 10) || 0
    const retentionPerYear = Math.round((employees * answers.averageSalary) * 0.001)
    return {
      adminHoursPerWeek: adminHours,
      reviewerHoursPerWeek: reviewerHours,
      savedPerYear: savedPerProgram,
      savedPerYearLabel: 'Reclaim',
      launchWeeksFaster: displayWeeks,
      retentionPerYear,
    }
  }

  return {
    adminHoursPerWeek: 0,
    reviewerHoursPerWeek: 0,
    savedPerYear: 0,
    savedPerYearLabel: 'Save' as const,
    launchWeeksFaster: 0,
    retentionPerYear: null as number | null,
  }
}

export type QuizProps = {
  title?: string
  subtitle?: string
  className?: string
  hubspotPortalId?: string
  hubspotFormId?: string
}

async function submitToHubSpot(
  answers: QuizAnswers,
  results: ReturnType<typeof computeResults>,
  portalId: string,
  formId: string
) {
  const hutk =
    typeof document !== 'undefined'
      ? document.cookie.match(/hubspotutk=([^;]*)/)?.[1]
      : undefined

  const fields = [
    { name: 'firstname', value: answers.firstName },
    { name: 'lastname', value: answers.lastName },
    { name: 'email', value: answers.workEmail },
    { name: 'company', value: answers.companyName },
    { name: 'phone', value: answers.phone },
    { name: 'industry', value: answers.industry ?? '' },
    { name: 'administrators', value: String(answers.administrators) },
    { name: 'reviewers', value: String(answers.reviewers) },
    { name: 'average_salary', value: String(answers.averageSalary) },
    { name: 'launch_time_months', value: String(answers.launchTimeMonths) },
    { name: 'total_employees', value: answers.totalEmployees },
    { name: 'roi_admin_hours', value: String(results.adminHoursPerWeek) },
    { name: 'roi_saved_per_year', value: String(results.savedPerYear) },
    { name: 'roi_reviewer_hours', value: String(results.reviewerHoursPerWeek) },
    { name: 'roi_weeks_faster', value: String(results.launchWeeksFaster) },
  ]

  const body: Record<string, unknown> = {
    fields,
    context: {
      pageUri: typeof window !== 'undefined' ? window.location.href : '',
      pageName: typeof document !== 'undefined' ? document.title : '',
    },
  }
  if (hutk) (body.context as Record<string, string>).hutk = hutk

  const res = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) throw new Error(`HubSpot submit failed: ${res.status}`)
}

export default function Quiz({
  title,
  subtitle,
  className = '',
  hubspotPortalId = '23126439',
  hubspotFormId = '19e6ef95-1082-407b-bf88-3abcaed174b3',
}: QuizProps) {
  const [answers, setAnswers] = useState<QuizAnswers>(defaultAnswers)
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateAnswer = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const contactFilled =
    answers.firstName.trim() !== '' &&
    answers.lastName.trim() !== '' &&
    answers.workEmail.trim() !== '' &&
    answers.companyName.trim() !== ''
  const privateEmployeesFilled =
    answers.industry !== 'private' ||
    (answers.totalEmployees.trim() !== '' && !Number.isNaN(parseInt(answers.totalEmployees, 10)))
  const canSeeResults =
    answers.industry !== null &&
    (answers.administrators > 0 || answers.reviewers > 0) &&
    contactFilled &&
    privateEmployeesFilled
  const results = computeResults(answers)

  return (
    <div className={`quiz ${className}`.trim()}>
     

      <form
        data-title={title}
        data-subtitle={subtitle}
        className="quiz-form"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!canSeeResults || isSubmitting) return
          setIsSubmitting(true)
          try {
            await submitToHubSpot(
              answers,
              results,
              hubspotPortalId,
              hubspotFormId
            )
            setShowResults(true)
          } catch (err) {
            console.error('HubSpot submission failed:', err)
          } finally {
            setIsSubmitting(false)
          }
        }}
      >
        <h3 className="quiz-step-title">1. Choose your industry</h3>
        <div className="quiz-segmented" role="group" aria-label="Industry">
          {INDUSTRIES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`quiz-segmented-option ${answers.industry === opt.id ? 'quiz-segmented-option--selected' : ''}`}
              onClick={() => updateAnswer('industry', opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {answers.industry === 'private' && (
          <>
            <h3 className="quiz-step-title">Total Employees</h3>
            <div className="quiz-field">
              <label htmlFor="quiz-total-employees">Number of employees (numeric only)</label>
              <input
                id="quiz-total-employees"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={answers.totalEmployees}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '')
                  updateAnswer('totalEmployees', v)
                }}
                className="quiz-input"
                placeholder=""
              />
            </div>
          </>
        )}

        <h3 className="quiz-step-title">2. How many team members do you work with?</h3>
        <div className="quiz-field">
          <label htmlFor="quiz-administrators">
            {answers.administrators} Administrators — number of team members that manage program(s).
          </label>
          <div
            className="quiz-slider-wrap"
            style={{ '--slider-fill': `${(answers.administrators / 25) * 100}%` } as React.CSSProperties}
          >
            <input
              id="quiz-administrators"
              type="range"
              min={0}
              max={25}
              value={answers.administrators}
              onChange={(e) => updateAnswer('administrators', Number(e.target.value))}
              className="quiz-range"
            />
            <div className="quiz-slider-labels">
              <span>0</span>
              <span>25+</span>
            </div>
          </div>
        </div>
        <div className="quiz-field">
          <label htmlFor="quiz-reviewers">
            {answers.reviewers} Reviewers — number of internal or external individuals that review applications.
          </label>
          <div
            className="quiz-slider-wrap"
            style={{ '--slider-fill': `${(answers.reviewers / 100) * 100}%` } as React.CSSProperties}
          >
            <input
              id="quiz-reviewers"
              type="range"
              min={0}
              max={100}
              value={answers.reviewers}
              onChange={(e) => updateAnswer('reviewers', Number(e.target.value))}
              className="quiz-range"
            />
            <div className="quiz-slider-labels">
              <span>0</span>
              <span>100+</span>
            </div>
          </div>
        </div>

        <h3 className="quiz-step-title">3. What is the average salary for an employee?</h3>
        <div className="quiz-field">
          <label htmlFor="quiz-salary">
            ${answers.averageSalary.toLocaleString()}
          </label>
          <div
            className="quiz-slider-wrap"
            style={{
              '--slider-fill': `${((answers.averageSalary - 10000) / 240000) * 100}%`,
            } as React.CSSProperties}
          >
            <input
              id="quiz-salary"
              type="range"
              min={10000}
              max={250000}
              step={1000}
              value={answers.averageSalary}
              onChange={(e) => updateAnswer('averageSalary', Number(e.target.value))}
              className="quiz-range"
            />
            <div className="quiz-slider-labels">
              <span>$10,000</span>
              <span>$250,000</span>
            </div>
          </div>
        </div>

        <h3 className="quiz-step-title">4. Currently, how long does it typically take you to launch a new grant program?</h3>
        <div className="quiz-field">
          <label htmlFor="quiz-launch">
            {answers.launchTimeMonths === 1
              ? 'Less than 1 month'
              : answers.launchTimeMonths >= 7
                ? '6 months or more'
                : answers.launchTimeMonths === 2
                  ? '1 month'
                  : `${answers.launchTimeMonths - 1} months`}
          </label>
          <div
            className="quiz-slider-wrap"
            style={{
              '--slider-fill': `${((answers.launchTimeMonths - 1) / 6) * 100}%`,
            } as React.CSSProperties}
          >
            <input
              id="quiz-launch"
              type="range"
              min={1}
              max={7}
              value={answers.launchTimeMonths}
              onChange={(e) => updateAnswer('launchTimeMonths', Number(e.target.value))}
              className="quiz-range"
            />
            <div className="quiz-slider-labels">
              <span>Less than 1 month</span>
              <span>6 months or more</span>
            </div>
          </div>
        </div>

        <h3 className="quiz-form-section-title">Fill out the form to see your results</h3>
        <div className="quiz-contact-grid">
          <div className="quiz-contact-field">
            <label htmlFor="quiz-first-name">First Name*</label>
            <input
              id="quiz-first-name"
              type="text"
              value={answers.firstName}
              onChange={(e) => updateAnswer('firstName', e.target.value)}
              className="quiz-input"
              placeholder=""
            />
          </div>
          <div className="quiz-contact-field">
            <label htmlFor="quiz-last-name">Last Name*</label>
            <input
              id="quiz-last-name"
              type="text"
              value={answers.lastName}
              onChange={(e) => updateAnswer('lastName', e.target.value)}
              className="quiz-input"
              placeholder=""
            />
          </div>
          <div className="quiz-contact-field">
            <label htmlFor="quiz-work-email">Work Email*</label>
            <input
              id="quiz-work-email"
              type="email"
              value={answers.workEmail}
              onChange={(e) => updateAnswer('workEmail', e.target.value)}
              className="quiz-input"
              placeholder=""
            />
          </div>
          <div className="quiz-contact-field">
            <label htmlFor="quiz-company-name">Company Name*</label>
            <input
              id="quiz-company-name"
              type="text"
              value={answers.companyName}
              onChange={(e) => updateAnswer('companyName', e.target.value)}
              className="quiz-input"
              placeholder=""
            />
          </div>
          <div className="quiz-contact-field quiz-contact-field--full">
            <label htmlFor="quiz-phone">Phone number</label>
            <input
              id="quiz-phone"
              type="tel"
              value={answers.phone}
              onChange={(e) => updateAnswer('phone', e.target.value)}
              className="quiz-input"
              placeholder=""
            />
          </div>
        </div>

        <button
          type="submit"
          className={`quiz-cta-btn ${isSubmitting ? 'quiz-cta-btn--loading' : ''}`}
          disabled={!canSeeResults || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="quiz-cta-btn-spinner" aria-hidden />
              Calculating…
            </>
          ) : (
            'Calculate My ROI'
          )}
        </button>
      </form>

      <section
        className={`quiz-results ${showResults && canSeeResults ? '' : 'quiz-results--blurred'}`}
        aria-label="Results"
      >
        {showResults && canSeeResults && (
          <p className="quiz-results-thanks">
            Thank you for your submission, review your ROI results below.
          </p>
        )}
        <div className="quiz-results-panel">
          <h2 className="quiz-results-title">Results</h2>
          <p className="quiz-results-intro">
            By combining your responses with our current customer averages in your industry, we estimate that with Submittable you could:
          </p>
          <div className="quiz-results-grid">
            <div className="quiz-results-item">
              Save administrators <strong>{results.adminHoursPerWeek} hours</strong> per week
            </div>
            <div className="quiz-results-item">
              {results.savedPerYearLabel} <strong>${results.savedPerYear.toLocaleString()}</strong>{' '}
              {answers.industry === 'private' ? 'per program in admin cost' : 'per year'}
            </div>
            <div className="quiz-results-item">
              Save reviewers <strong>{results.reviewerHoursPerWeek} hours</strong> per week
            </div>
            <div className="quiz-results-item">
              Launch your program <strong>{results.launchWeeksFaster} weeks</strong> faster
            </div>
            {results.retentionPerYear != null && results.retentionPerYear > 0 && (
              <div className="quiz-results-item quiz-results-item--full">
                Save <strong>${results.retentionPerYear.toLocaleString()}</strong> per year in
                improved retention
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
