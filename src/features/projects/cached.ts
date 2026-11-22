import { cache } from 'react';

import { getProjectByKey } from '@/features/projects/queries';

/** The layout and the page of a project both need it; fetch it once. */
export const loadProject = cache(getProjectByKey);
