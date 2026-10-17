import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const arrayFromResponse = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.results) ? payload.results : [];
};

const paginatedResponse = async (url) => {
  const response = await api.get(url);
  return response.data && Array.isArray(response.data.results)
    ? response.data
    : { count: 0, next: null, previous: null, results: [] };
};

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/profile/');
      return response.data;
    },
  });
}

export function useSkillGroups() {
  return useQuery({
    queryKey: ['skill-groups'],
    queryFn: async () => {
      const response = await api.get('/skill-groups/');
      return arrayFromResponse(response);
    },
  });
}

export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: async () => {
      const response = await api.get('/experiences/');
      return arrayFromResponse(response);
    },
  });
}

export function useEducation() {
  return useQuery({
    queryKey: ['education'],
    queryFn: async () => {
      const response = await api.get('/education/');
      return arrayFromResponse(response);
    },
  });
}

export function useProjects(params = {}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const response = await api.get('/projects/', { params });
      return response.data && Array.isArray(response.data.results)
        ? response.data
        : { count: 0, next: null, previous: null, results: [] };
    },
  });
}

export function usePosts(params = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: async () => {
      const response = await api.get('/posts/', { params });
      return response.data && Array.isArray(response.data.results)
        ? response.data
        : { count: 0, next: null, previous: null, results: [] };
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories/');
      return arrayFromResponse(response);
    },
  });
}
