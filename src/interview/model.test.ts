import { describe, expect, it } from 'vitest'
import {
  QUESTION_BANK,
  answerFilled,
  composeStar,
  emptyAnswer,
  filterQuestions,
  randomQuestion,
} from './model'

describe('composeStar / answerFilled', () => {
  it('joins the filled sections', () => {
    const answer = { ...emptyAnswer('Q'), situation: 'S', action: 'A' }
    expect(composeStar(answer)).toBe('S\n\nA')
    expect(answerFilled(answer)).toBe(true)
  })

  it('is false when fewer than two sections are filled', () => {
    expect(answerFilled({ ...emptyAnswer('Q'), situation: 'S' })).toBe(false)
  })
})

describe('filterQuestions', () => {
  it('filters by category and has entries in every category', () => {
    expect(filterQuestions('all')).toHaveLength(QUESTION_BANK.length)
    expect(filterQuestions('technical').every((question) => question.category === 'technical')).toBe(true)
    expect(filterQuestions('technical').length).toBeGreaterThan(0)
  })
})

describe('randomQuestion', () => {
  it('can exclude the current question', () => {
    const next = randomQuestion(QUESTION_BANK[0]!.text)
    expect(next.text).not.toBe(QUESTION_BANK[0]!.text)
  })
})
