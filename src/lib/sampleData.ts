import type { Resume } from '../types'
import { DEFAULT_SECTION_ORDER, uid } from './helpers'

export const sampleResume = (): Resume => ({
  profile: {
    fullName: 'Jordan Avery',
    headline: 'Senior Frontend Engineer',
    email: 'jordan.avery@email.com',
    phone: '+1 (555) 123-4567',
    location: 'Austin, TX',
    website: 'jordanavery.dev',
    summary:
      'Senior frontend engineer with 8+ years building accessible, high-performance web applications. Specialized in React, TypeScript, and design systems. Passionate about developer experience and shipping measurable business impact.',
    links: [
      { id: uid(), label: 'LinkedIn', url: 'linkedin.com/in/jordanavery' },
      { id: uid(), label: 'GitHub', url: 'github.com/jordanavery' },
    ],
  },
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  experience: [
    {
      id: uid(),
      company: 'Northwind Analytics',
      role: 'Senior Frontend Engineer',
      location: 'Austin, TX',
      start: 'Mar 2021',
      end: '',
      current: true,
      bullets: [
        'Led migration of a legacy dashboard to React + TypeScript, cutting load time by 42%.',
        'Built a shared component library adopted by 6 product teams, reducing UI defects by 30%.',
        'Mentored 4 engineers and established a frontend testing standard now used company-wide.',
      ],
    },
    {
      id: uid(),
      company: 'BrightLayer',
      role: 'Frontend Engineer',
      location: 'Remote',
      start: 'Jun 2018',
      end: 'Feb 2021',
      current: false,
      bullets: [
        'Delivered a customer portal used by 50k monthly active users.',
        'Improved Lighthouse accessibility score from 71 to 98 across core flows.',
      ],
    },
  ],
  education: [
    {
      id: uid(),
      school: 'University of Texas at Austin',
      degree: 'B.S.',
      field: 'Computer Science',
      location: 'Austin, TX',
      start: '2014',
      end: '2018',
      details: 'Graduated with honors. Coursework in algorithms, HCI, and distributed systems.',
    },
  ],
  skills: [
    {
      id: uid(),
      category: 'Languages',
      items: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'SQL'],
    },
    {
      id: uid(),
      category: 'Frameworks & Tools',
      items: ['React', 'Vite', 'Node.js', 'Testing Library', 'Git'],
    },
  ],
  projects: [
    {
      id: uid(),
      name: 'OpenCharts',
      link: 'github.com/jordanavery/opencharts',
      description: 'Lightweight, accessible charting library for React.',
      bullets: ['2.1k GitHub stars', 'Zero runtime dependencies'],
    },
  ],
  certifications: [
    { id: uid(), name: 'Professional Scrum Master I', issuer: 'Scrum.org', date: '2022', link: '' },
  ],
  languages: [
    { id: uid(), name: 'English', proficiency: 'Native' },
    { id: uid(), name: 'Spanish', proficiency: 'Professional' },
  ],
})
