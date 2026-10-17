import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const dashboardQueryOptions = {
  staleTime: 0,
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
};

// ─── Overview Stats ──────────────────────────────────────────────────────────
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats/');
      return res.data;
    },
    ...dashboardQueryOptions,
  });
}

// ─── Posts ───────────────────────────────────────────────────────────────────
export function useDashboardPosts(params = {}) {
  return useQuery({
    queryKey: ['dashboard-posts', params],
    queryFn: async () => {
      const queryParams = { ...params };
      if (!queryParams.status || queryParams.status === 'all') {
        queryParams.status = 'all';
      }
      const res = await api.get('/posts/', { params: queryParams });
      return res.data;
    },
    ...dashboardQueryOptions,
  });
}

export function useDashboardPost(slug) {
  return useQuery({
    queryKey: ['dashboard-post', slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await api.get(`/posts/${slug}/`);
      return res.data;
    },
    enabled: Boolean(slug),
    ...dashboardQueryOptions,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/posts/', formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, formData }) => {
      const res = await api.patch(`/posts/${slug}/`, formData);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-posts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-post', variables.slug] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.slug] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug) => {
      await api.delete(`/posts/${slug}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

// ─── Comments Moderation ─────────────────────────────────────────────────────
export function useDashboardComments(params = {}) {
  return useQuery({
    queryKey: ['dashboard-comments', params],
    queryFn: async () => {
      const res = await api.get('/comments/', { params });
      return res.data;
    },
    ...dashboardQueryOptions,
  });
}

export function useToggleApproveComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_approved }) => {
      const res = await api.patch(`/comments/${id}/`, { is_approved });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-comments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/comments/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-comments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

// ─── Messages Inbox ──────────────────────────────────────────────────────────
export function useDashboardMessages(params = {}) {
  return useQuery({
    queryKey: ['dashboard-contact', params],
    queryFn: async () => {
      const res = await api.get('/contact/', { params });
      return res.data;
    },
    ...dashboardQueryOptions,
  });
}

export function useToggleReadMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_read }) => {
      const res = await api.patch(`/contact/${id}/`, { is_read });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-contact'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/contact/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-contact'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// ─── Projects ────────────────────────────────────────────────────────────────
export function useDashboardProjects(params = {}) {
  return useQuery({
    queryKey: ['dashboard-projects', params],
    queryFn: async () => {
      const res = await api.get('/projects/', { params });
      return res.data;
    },
    ...dashboardQueryOptions,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/projects/', formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, formData }) => {
      const res = await api.patch(`/projects/${slug}/`, formData);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.slug] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug) => {
      await api.delete(`/projects/${slug}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// ─── Skills, Sections & Groups ───────────────────────────────────────────────
export function useSkillGroups() {
  return useQuery({
    queryKey: ['skill-groups'],
    queryFn: async () => {
      const res = await api.get('/skill-groups/');
      return Array.isArray(res.data) ? res.data : [];
    },
    ...dashboardQueryOptions,
  });
}

export function useAllSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const res = await api.get('/skills/');
      return Array.isArray(res.data) ? res.data : [];
    },
    ...dashboardQueryOptions,
  });
}

export function useCreateSkillGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/skill-groups/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateSkillGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => (await api.patch(`/skill-groups/${id}/`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-groups'] });
    },
  });
}

export function useDeleteSkillGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/skill-groups/${id}/`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useCreateSkillSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/skill-sections/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-groups'] });
    },
  });
}

export function useUpdateSkillSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => (await api.patch(`/skill-sections/${id}/`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-groups'] });
    },
  });
}

export function useDeleteSkillSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/skill-sections/${id}/`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-groups'] });
    },
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/skills/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-groups'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => (await api.patch(`/skills/${id}/`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-groups'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/skills/${id}/`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-groups'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// ─── Experience & Education ──────────────────────────────────────────────────
export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: async () => {
      const res = await api.get('/experiences/');
      return Array.isArray(res.data) ? res.data : [];
    },
    ...dashboardQueryOptions,
  });
}

export function useCreateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/experiences/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => (await api.patch(`/experiences/${id}/`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/experiences/${id}/`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useEducation() {
  return useQuery({
    queryKey: ['education'],
    queryFn: async () => {
      const res = await api.get('/education/');
      return Array.isArray(res.data) ? res.data : [];
    },
    ...dashboardQueryOptions,
  });
}

export function useCreateEducation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/education/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
    },
  });
}

export function useUpdateEducation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => (await api.patch(`/education/${id}/`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
    },
  });
}

export function useDeleteEducation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/education/${id}/`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
    },
  });
}

// ─── Taxonomy (Categories & Tags) ────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories/');
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data?.results)) return res.data.results;
      return [];
    },
    ...dashboardQueryOptions,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/categories/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => (await api.patch(`/categories/${id}/`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/categories/${id}/`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await api.get('/tags/');
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data?.results)) return res.data.results;
      return [];
    },
    ...dashboardQueryOptions,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/tags/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => (await api.patch(`/tags/${id}/`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/tags/${id}/`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// ─── Profile & Password ──────────────────────────────────────────────────────
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/profile/');
      return res.data;
    },
    ...dashboardQueryOptions,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await api.patch('/profile/', formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/auth/change-password/', payload);
      return res.data;
    },
  });
}
