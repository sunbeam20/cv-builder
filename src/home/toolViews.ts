import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import type { ToolId } from './tools'

/**
 * Single extension point for adding tools: register the tool in `tools.ts` and
 * point its id at a lazily-loaded view here. Tools without a view render
 * `<ComingSoon />` from `Root`.
 */
export const TOOL_VIEWS: Record<ToolId, LazyExoticComponent<ComponentType>> = {
  'cv-builder': lazy(() => import('../App')),
  'ats-scanner': lazy(() => import('../ats/AtsApp')),
  'banner-maker': lazy(() => import('../banner/BannerApp')),
  'web-portfolio': lazy(() => import('../portfolio/PortfolioApp')),
}