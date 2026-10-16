/**
 * Application Constants (SPEC §3, §4, §8)
 */

export const SKILL_CATEGORIES = [
  { value: 'FRONTEND', label: 'Frontend' },
  { value: 'BACKEND', label: 'Backend' },
  { value: 'DATABASE', label: 'Database' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'TOOLS', label: 'Tools' },
  { value: 'SOFT_SKILL', label: 'Soft Skills' },
];

export const PROJECT_CATEGORIES = [
  { value: 'WEB', label: 'Web' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'API', label: 'API' },
  { value: 'ML', label: 'Machine Learning' },
  { value: 'OTHER', label: 'Other' },
];

export const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'CONTRACT', label: 'Contract' },
];

export const POST_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
};

export const PAGINATION = {
  PROJECTS_PER_PAGE: 9,
  POSTS_PER_PAGE: 6,
  COMMENTS_PER_PAGE: 10,
  CONTACT_PER_PAGE: 10,
};

export const POST_SORT_OPTIONS = [
  { value: '-published_at', label: 'Newest' },
  { value: '-views_count', label: 'Most Viewed' },
  { value: '-likes_count', label: 'Most Liked' },
  { value: 'title', label: 'A–Z' },
];

export const PROJECT_SORT_OPTIONS = [
  { value: '-completed_date', label: 'Latest Completed' },
  { value: 'display_order', label: 'Curated Order' },
];
