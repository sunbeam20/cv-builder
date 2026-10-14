export type QuestionCategory = 'behavioural' | 'technical' | 'culture' | 'closing'

export type RolePack = 'general' | 'software' | 'product' | 'sales' | 'design'

export const ROLE_PACKS: { id: RolePack; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'software', label: 'Software' },
  { id: 'product', label: 'Product' },
  { id: 'sales', label: 'Sales' },
  { id: 'design', label: 'Design' },
]

export interface Question {
  id: string
  category: QuestionCategory
  text: string
  packs: RolePack[]
}

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  behavioural: 'Behavioural',
  technical: 'Technical',
  culture: 'Culture & fit',
  closing: 'Closing',
}

export const QUESTION_BANK: Question[] = [
  { id: 'q1', category: 'behavioural', text: 'Tell me about a time you disagreed with a teammate.', packs: ['general'] },
  { id: 'q2', category: 'behavioural', text: 'Describe a project you are most proud of.', packs: ['general'] },
  { id: 'q3', category: 'behavioural', text: 'Tell me about a time you failed and what you learned.', packs: ['general'] },
  { id: 'q4', category: 'behavioural', text: 'When did you go beyond your job description?', packs: ['general'] },
  { id: 'q5', category: 'behavioural', text: 'How do you handle competing priorities?', packs: ['general'] },
  { id: 'q6', category: 'technical', text: 'Walk me through how you would design a URL shortener.', packs: ['software'] },
  { id: 'q7', category: 'technical', text: 'How do you approach debugging a production issue?', packs: ['software'] },
  { id: 'q8', category: 'technical', text: 'Explain a technical concept you recently learned.', packs: ['general'] },
  { id: 'q9', category: 'technical', text: 'How do you ensure the quality of your work?', packs: ['general'] },
  { id: 'q10', category: 'culture', text: 'What kind of team do you do your best work in?', packs: ['general'] },
  { id: 'q11', category: 'culture', text: 'How do you like to receive feedback?', packs: ['general'] },
  { id: 'q12', category: 'culture', text: 'What are you looking for in your next role?', packs: ['general'] },
  { id: 'q13', category: 'culture', text: 'How do you keep learning and growing?', packs: ['general'] },
  { id: 'q14', category: 'closing', text: 'Why do you want to work here?', packs: ['general'] },
  { id: 'q15', category: 'closing', text: 'What questions do you have for us?', packs: ['general'] },
  { id: 'q16', category: 'closing', text: 'Where do you see yourself in three years?', packs: ['general'] },
  { id: 'q17', category: 'technical', text: 'How would you scale a service to handle ten times the traffic?', packs: ['software'] },
  { id: 'q18', category: 'technical', text: 'How do you decide when to pay down technical debt?', packs: ['software'] },
  { id: 'q19', category: 'technical', text: 'How do you review a teammate’s pull request?', packs: ['software'] },
  { id: 'q20', category: 'technical', text: 'Describe how you would test a critical feature end to end.', packs: ['software'] },
  { id: 'q21', category: 'behavioural', text: 'Tell me about a production incident you owned.', packs: ['software'] },
  { id: 'q22', category: 'behavioural', text: 'How do you prioritise a product roadmap?', packs: ['product'] },
  { id: 'q23', category: 'behavioural', text: 'How do you measure whether a product launch succeeded?', packs: ['product'] },
  { id: 'q24', category: 'behavioural', text: 'Tell me about a feature you decided not to build.', packs: ['product'] },
  { id: 'q25', category: 'behavioural', text: 'How do you balance user needs against business goals?', packs: ['product', 'design'] },
  { id: 'q26', category: 'behavioural', text: 'Walk me through how you handle a lost deal.', packs: ['sales'] },
  { id: 'q27', category: 'behavioural', text: 'How do you build and qualify a sales pipeline?', packs: ['sales'] },
  { id: 'q28', category: 'behavioural', text: 'Describe your process for discovering a customer’s needs.', packs: ['sales'] },
  { id: 'q29', category: 'behavioural', text: 'Walk me through your design process from brief to handoff.', packs: ['design'] },
  { id: 'q30', category: 'behavioural', text: 'How do you respond to critical design feedback?', packs: ['design'] },
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

export interface AnswerFeedback {
  score: number
  max: number
  tips: string[]
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

export const filterQuestions = (
  category: QuestionCategory | 'all',
  pack: RolePack | 'all' = 'all',
): Question[] =>
  QUESTION_BANK.filter((question) => {
    const matchesCategory = category === 'all' || question.category === category
    const matchesPack =
      pack === 'all' || question.packs.includes(pack) || question.packs.includes('general')
    return matchesCategory && matchesPack
  })

export const feedbackFor = (answer: StarAnswer): AnswerFeedback => {
  const composed = composeStar(answer)
  const checks: { pass: boolean; tip: string }[] = [
    {
      pass: answer.situation.trim().length >= 20,
      tip: 'Set the situation with at least 20 characters.',
    },
    {
      pass: answer.task.trim().length > 0,
      tip: 'Spell out your specific task or goal.',
    },
    {
      pass: answer.action.trim().length >= 40,
      tip: 'Write at least 40 characters describing your action.',
    },
    {
      pass: answer.result.trim().length > 0 && /\d/.test(answer.result),
      tip: 'Quantify the result with a number.',
    },
    {
      pass: /\bI\b/.test(answer.action),
      tip: 'Write the action in first person.',
    },
    {
      pass: composed.length >= 120,
      tip: 'Aim for at least 120 characters overall.',
    },
  ]
  const tips = checks.filter((check) => !check.pass).map((check) => check.tip)
  return { score: checks.length - tips.length, max: checks.length, tips }
}
