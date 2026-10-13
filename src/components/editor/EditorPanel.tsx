import { ProfileForm } from './ProfileForm'
import { ExperienceForm } from './ExperienceForm'
import { EducationForm } from './EducationForm'
import { SkillsForm } from './SkillsForm'
import { ProjectsForm } from './ProjectsForm'
import { CertificationsForm } from './CertificationsForm'
import { LanguagesForm } from './LanguagesForm'
import { SectionsPanel } from './SectionsPanel'
import { CompletenessCard } from './CompletenessCard'
import { JDMatcher } from './JDMatcher'
import { WelcomeBanner } from './WelcomeBanner'

export function EditorPanel() {
  return (
    <div className="flex flex-col gap-4">
      <WelcomeBanner />
      <CompletenessCard />
      <JDMatcher />
      <SectionsPanel />
      <div id="section-profile" className="scroll-mt-24">
        <ProfileForm />
      </div>
      <div id="section-experience" className="scroll-mt-24">
        <ExperienceForm />
      </div>
      <div id="section-education" className="scroll-mt-24">
        <EducationForm />
      </div>
      <div id="section-skills" className="scroll-mt-24">
        <SkillsForm />
      </div>
      <div id="section-projects" className="scroll-mt-24">
        <ProjectsForm />
      </div>
      <div id="section-certifications" className="scroll-mt-24">
        <CertificationsForm />
      </div>
      <div id="section-languages" className="scroll-mt-24">
        <LanguagesForm />
      </div>
    </div>
  )
}