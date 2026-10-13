export type QuestionCategory = 'behavioural' | 'technical' | 'culture' | 'closing'

export interface Question {
  id: string
  category: QuestionCategory
  text: string
}

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  behavioural: 'Behavioural',
  technical: 'Technical',
  culture: 'Culture & fit',
  closing: 'Closing',
}

export const QUESTION_BANK: Question[] = [
  { id: 'q1', category: 'behavioural', text: 'Tell me about a time you disagreed with a teammate.' },
  { id: 'q2', category: 'behavioural', text: 'Describe a project you are most proud of.' },
  { id: 'q3', category: 'behavioural', text: 'Tell me about a time you failed and what you learned.' },
  { id: 'q4', category: 'behavioural', text: 'When did you go beyond your job description?' },
  { id: 'q5', category: 'behavioural', text: 'How do you handle competing priorities?' },
  { id: 'q6', category: 'technical', text: 'Walk me through how you would design a URL shortener.' },
  { id: 'q7', category: 'technical', text: 'How do you approach debugging a production issue?' },
  { id: 'q8', category: 'technical', text: 'Explain a technical concept you recently learned.' },
  { id: 'q9', category: 'technical', text: 'How do you ensure the quality of your work?' },
  { id: 'q10', category: 'culture', text: 'What kind of team do you do your best work in?' },
  { id: 'q11', category: 'culture', text: 'How do you like to receive feedback?' },
  { id: 'q12', category: 'culture', text: 'What are you looking for in your next role?' },
  { id: 'q13', category: 'culture', text: 'How do you keep learning and growing?' },
  { id: 'q14', category: 'closing', text: 'Why do you want to work here?' },
  { id: 'q15', category: 'closing', text: 'What questions do you have for us?' },
  { id: 'q16', category: 'closing', text: 'Where do you see yourself in three years?' },
]

export const STAR_FIELDS = ['situation', 'task', 'action', 'result'] as const
export type StarField = (typeof STAR_FIELDS)[number]

export interface StarAnswer {
  id: string
  question: string
  situation: string
  task: string
  action: string
  result: string
  createdAt: string
}

export const STAR_HINTS: Record<StarField, string> = {
  situation: 'Set the scene — the context and the challenge.',
  task: 'What was your specific responsibility or goal?',
  action: 'The steps you personally took. Use “I”.',
  result: 'The outcome, ideally with a measurable result.',
}

export const uid = (): string => Math.random().toString(36).slice(2, 11)

export const emptyAnswer = (question = ''): StarAnswer => ({
  id: uid(),
  question,
  situation: '',
  task: '',
  action: '',
  result: '',
  createdAt: new Date().toISOString(),
})

export const composeStar = (answer: StarAnswer): string =>
  [
    answer.situation.trim(),
    answer.task.trim(),
    answer.action.trim(),
    answer.result.trim(),
  ]
    .filter(Boolean)
    .join('\n\n')

export const answerFilled = (answer: StarAnswer): boolean =>
  STAR_FIELDS.filter((field) => answer[field].trim()).length >= 2

export const randomQuestion = (exclude = ''): Question => {
  const pool = QUESTION_BANK.filter((question) => question.text !== exclude)
  return pool[Math.floor(Math.random() * pool.length)] ?? QUESTION_BANK[0]!
}

export const filterQuestions = (category: QuestionCategory | 'all'): Question[] =>
  category === 'all' ? QUESTION_BANK : QUESTION_BANK.filter((question) => question.category === category)
