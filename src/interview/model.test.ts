import { describe, expect, it } from 'vitest'
import {
  QUESTION_BANK,
  answerFilled,
  composeStar,
  emptyAnswer,
  feedbackFor,
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

  it('filters by role pack keeping software and general questions', () => {
    const questions = filterQuestions('all', 'software')
    expect(questions.length).toBeGreaterThan(0)
    expect(
      questions.every(
        (question) => question.packs.includes('software') || question.packs.includes('general'),
      ),
    ).toBe(true)
  })
})

describe('feedbackFor', () => {
  it('scores an empty answer low and returns tips', () => {
    const feedback = feedbackFor(emptyAnswer('q'))
    expect(feedback.score).toBeLessThanOrEqual(1)
    expect(feedback.max).toBe(6)
    expect(feedback.tips.length).toBeGreaterThan(0)
  })

  it('scores a strong first-person quantified answer highly with no tips', () => {
    const strong = {
      ...emptyAnswer('Q'),
      situation: 'Our team was facing a serious reliability problem in production.',
      task: 'I was asked to lead the investigation and fix the root cause.',
      action:
        'I traced the failing requests, added monitoring, and shipped a targeted fix that reduced errors.',
      result: 'Error rates dropped by 42% within a week.',
    }
    const feedback = feedbackFor(strong)
    expect(feedback.score).toBeGreaterThanOrEqual(5)
    expect(feedback.tips).toHaveLength(0)
  })
})

describe('randomQuestion', () => {
  it('can exclude the current question', () => {
    const next = randomQuestion(QUESTION_BANK[0]!.text)
    expect(next.text).not.toBe(QUESTION_BANK[0]!.text)
  })
})
