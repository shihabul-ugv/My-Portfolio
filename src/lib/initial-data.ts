import initialDataJson from "../../scripts/initial-data.json";

export interface ProjectData {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  role: string | null;
  timeline: string | null;
  problem: string | null;
  solution: string | null;
  externalLink: string | null;
  caseStudy: string | null;
  published: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function getInitialProjects(): ProjectData[] {
  const list = ((initialDataJson.projects || []) as ProjectData[])
    .filter(p => p.slug !== "smartpark-ai-parking-management");
  return list.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
      return a.order - b.order;
    }
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });
}

export function getInitialProfile() {
  return initialDataJson.profiles?.[0] || null;
}

export function getInitialSkills() {
  return initialDataJson.skills || [];
}

export function getInitialExperiences() {
  return initialDataJson.experiences || [];
}

export function getInitialAcademics() {
  return initialDataJson.academics || [];
}
