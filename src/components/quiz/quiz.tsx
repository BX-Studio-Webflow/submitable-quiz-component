import { useState } from 'react'
import './quiz.css'

export type QuizAnswers = {
  industry: 'nonprofit' | 'public' | 'private' | null
  administrators: number
  reviewers: number
  averageSalary: number
  launchTimeMonths: number
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
  industry: null,
  administrators: 0,
  reviewers: 0,
  averageSalary: 10000,
  launchTimeMonths: 1,
  firstName: '',
  lastName: '',
  workEmail: '',
  companyName: '',
  phone: '',
}

function computeResults(answers: QuizAnswers) {
  const baseMultiplier = answers.industry === 'nonprofit' ? 1.2 : answers.industry === 'public' ? 1.1 : 1
  const adminHours = Math.round(answers.administrators * 3 * baseMultiplier)
  const reviewerHours = Math.round(answers.reviewers * 1.5 * baseMultiplier)
  const hourlyRate = answers.averageSalary / 52 / 40
  const savedDollars = Math.round((adminHours + reviewerHours) * 52 * hourlyRate)
  const weeksFaster = Math.round(answers.launchTimeMonths * 2.5 * baseMultiplier)
  return {
    adminHoursPerWeek: adminHours,
    reviewerHoursPerWeek: reviewerHours,
    savedPerYear: savedDollars,
    launchWeeksFaster: weeksFaster,
  }
}

export type QuizProps = {
  title?: string
  subtitle?: string
  className?: string
}

export default function Quiz({ title, subtitle, className = '' }: QuizProps) {
  const [answers, setAnswers] = useState<QuizAnswers>(defaultAnswers)
  const [showResults, setShowResults] = useState(false)

  const updateAnswer = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const canSeeResults =
    answers.industry !== null && (answers.administrators > 0 || answers.reviewers > 0)
  const results = computeResults(answers)

  return (
    <div className={`quiz ${className}`.trim()}>
     

      <form
        data-title={title}
        data-subtitle={subtitle}
        className="quiz-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (canSeeResults) setShowResults(true)
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

        <h3 className="quiz-step-title">2. How many team members do you work with?</h3>
        <div className="quiz-field">
          <label htmlFor="quiz-administrators">
            {answers.administrators} Administrators — number of team members that manage program(s).
          </label>
          <div className="quiz-slider-wrap">
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
          <div className="quiz-slider-wrap">
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
          <div className="quiz-slider-wrap">
            <input
              id="quiz-salary"
              type="range"
              min={10000}
              max={250000}
              step={5000}
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
              : answers.launchTimeMonths >= 6
                ? '6 months or more'
                : `${answers.launchTimeMonths} months`}
          </label>
          <div className="quiz-slider-wrap">
            <input
              id="quiz-launch"
              type="range"
              min={1}
              max={6}
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
          className="quiz-cta-btn"
          disabled={!canSeeResults}
        >
          Calculate My ROI
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
              Save <strong>${results.savedPerYear.toLocaleString()}</strong> per year
            </div>
            <div className="quiz-results-item">
              Save reviewers <strong>{results.reviewerHoursPerWeek} hours</strong> per week
            </div>
            <div className="quiz-results-item">
              Launch your program <strong>{results.launchWeeksFaster} weeks</strong> faster
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
