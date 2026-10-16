/**
 * src/data/profile.js
 * Static data shown in the Hero section while the API call is in flight
 * (or as a fallback). Keep the real data here; update when you edit the
 * Django Profile model too. This is the ONLY place content lives in the
 * frontend source (SPEC F-1 – design tokens and static UI copy are fine).
 */

const profile = {
  name: 'Yasin',
  role: 'Full-Stack Developer',
  focus: ['Django & DRF', 'React & Vite', 'PostgreSQL', 'DevOps'],
  description:
    'Building clean, scalable web apps from backend APIs to pixel-perfect UIs.',
  /** Swap this for your real photo once you add it to public/ */
  photo: null, // e.g. '/avatar.jpg'
  openToWork: true,
};

export default profile;
