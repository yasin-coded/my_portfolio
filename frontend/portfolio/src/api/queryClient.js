import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes for public views
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status >= 400 && status < 500 && status !== 408) return false;
        if (status === 429) return false;
        return failureCount < 1;
      },
    },
  },
});

export default queryClient;
