import type { CareerJob } from "../content/jobs";
export type CareerCard = Pick<CareerJob, "slug" | "name" | "category" | "tasks" | "skills" | "conclusion" | "entrySkills">;
export function careerCard(job: CareerJob): CareerCard { const { slug, name, category, tasks, skills, conclusion, entrySkills } = job; return { slug, name, category, tasks, skills, conclusion, entrySkills }; }
