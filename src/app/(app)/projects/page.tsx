import { Metadata } from 'next';

import { getProjects } from '@/lib/projects';

import UnstyledLink from '@/components/links/UnstyledLink';

export const metadata: Metadata = {
  title: 'Projects',
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <section>
      <h1 className='h3'>Projects</h1>
      <ul className='mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
        {projects.map((project) => (
          <li key={project.id}>
            <UnstyledLink
              href={`/projects/${project.id}`}
              className='flex items-center gap-3 rounded-md border border-gray-200 p-3 hover:bg-gray-50'
            >
              <span
                aria-hidden
                className='size-3 shrink-0 rounded-full'
                style={{ backgroundColor: project.color }}
              />
              <span className='truncate font-medium'>{project.name}</span>
              <span className='ml-auto text-xs text-gray-500 md:text-xs'>
                {project.key}
              </span>
            </UnstyledLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
