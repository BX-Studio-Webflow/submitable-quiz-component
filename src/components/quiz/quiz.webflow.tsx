import { declareComponent } from '@webflow/react'
import { props } from '@webflow/data-types'
import Quiz from './quiz'

const QuizWebflow = declareComponent(Quiz, {
  name: 'Quiz',
  description: 'ROI calculator with 3 tabs: Your details, Team & timeline, Results',
  group: 'Brian\'s components',
  props: {
    title: props.Text({
      name: 'Title',
      defaultValue: 'ROI Calculator',
    }),
    subtitle: props.Text({
      name: 'Subtitle',
      defaultValue: "What's the value of a purpose-built platform? Estimate hours and dollars saved and time to launch.",
    }),
    className: props.Text({
      name: 'Class Name',
      defaultValue: '',
    }),
  },
})

export default QuizWebflow
