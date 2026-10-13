import { ProfileForm } from './ProfileForm'
import { ExperienceForm } from './ExperienceForm'
import { EducationForm } from './EducationForm'
import { SkillsForm } from './SkillsForm'
import { ProjectsForm } from './ProjectsForm'
import { CertificationsForm } from './CertificationsForm'
import { LanguagesForm } from './LanguagesForm'

export function EditorPanel() {
  return (
    <div className="flex flex-col gap-4">
      <ProfileForm />
      <ExperienceForm />
      <EducationForm />
      <SkillsForm />
      <ProjectsForm />
      <CertificationsForm />
      <LanguagesForm />
    </div>
  )
}
