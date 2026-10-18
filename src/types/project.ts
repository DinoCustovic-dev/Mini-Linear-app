export type Project = {
  id: string;
  name: string;
  /** Short uppercase prefix used in issue identifiers, e.g. "WEB" */
  key: string;
  /** Any valid CSS color, used for the project dot */
  color: string;
};

export type CurrentUser = {
  name: string;
  email: string;
  avatarUrl?: string;
};
