import type { CareerJob } from "../content/jobs";
export type CareerCard = Pick<CareerJob, "slug" | "name" | "category" | "tasks" | "skills" | "conclusion" | "entrySkills" | "qualifications">;
export function careerCard(job: CareerJob): CareerCard { const { slug, name, category, tasks, skills, conclusion, entrySkills, qualifications } = job; return { slug, name, category, tasks, skills, conclusion, entrySkills, qualifications }; }

export type RouteCandidate = Pick<CareerJob, "slug" | "name" | "category" | "conclusion" | "routeTags"> & {categoryLabel: string};
export function routeCandidate(job: CareerJob, categoryLabel: string): RouteCandidate { const {slug,name,category,conclusion,routeTags}=job; return {slug,name,category,conclusion,routeTags,categoryLabel}; }
