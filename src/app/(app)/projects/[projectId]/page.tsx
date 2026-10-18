import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getProject } from '@/lib/projects';

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const project = await getProject(projectId);
  return { title: project?.name ?? 'Project' };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project) notFound();

  return (
    <section>
      <h1 className='h3 truncate'>{project.name}</h1>
      <p className='mt-2 text-gray-500'>
        Issues for {project.key} will show up here.
      </p>
    </section>
  );
}
