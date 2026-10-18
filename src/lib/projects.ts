import { MOCK_PROJECTS, MOCK_USER } from '@/data/mock';

import type { CurrentUser, Project } from '@/types/project';

// TODO: replace mock data with Supabase queries once the schema and auth land.

export async function getProjects(): Promise<Project[]> {
  return MOCK_PROJECTS;
}

export async function getProject(id: string): Promise<Project | undefined> {
  return MOCK_PROJECTS.find((project) => project.id === id);
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return MOCK_USER;
}
