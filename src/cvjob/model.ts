import type { Resume } from '../types'
import {
  extractKeywords,
  matchTextToJob,
  resumePlainText,
  type KeywordMatchReport,
} from '../lib/match'

export type ScoreBand = 'low' | 'medium' | 'high'

export interface ScoreBandInfo {
  label: string
  tone: ScoreBand
  advice: string
}

export function scoreBand(score: number): ScoreBandInfo {
  if (score >= 75) {
    return { label: 'Strong match', tone: 'high', advice: 'Your CV already covers most keywords. Refine phrasing, do not keyword-stuff.' }
  }
  if (score >= 45) {
    return { label: 'Partial match', tone: 'medium', advice: 'Add the missing keywords where they reflect real experience.' }
  }
  return { label: 'Low match', tone: 'low', advice: 'Tailor your summary and skills closely to this posting before applying.' }
}

export interface AnalysisReport extends KeywordMatchReport {
  jobKeywords: string[]
  band: ScoreBandInfo
}

export function analyseText(text: string, jobDescription: string, extra: string[] = []): AnalysisReport {
  const report = matchTextToJob(text, jobDescription, extra)
  return {
    ...report,
    jobKeywords: extractKeywords(jobDescription),
    band: scoreBand(report.score),
  }
}

export function analyseResume(resume: Resume, jobDescription: string, extra: string[] = []): AnalysisReport {
  return analyseText(resumePlainText(resume), jobDescription, extra)
}

export function analyseResumeVsJob(resume: Resume, jobDescription: string): AnalysisReport {
  return analyseResume(resume, jobDescription)
}

export const coverage = (report: KeywordMatchReport): number =>
  report.keywords.length === 0 ? 0 : Math.round((report.matched.length / report.keywords.length) * 100)

export const parseExtraKeywords = (raw: string): string[] =>
  raw
    .split(/[\n,]/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
