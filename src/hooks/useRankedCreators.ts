import { useInfiniteQuery } from '@tanstack/react-query';

interface RankedCreator {
  id: string;
  name: string;
  tier: string;
  xp: number;
  rankScore: number;
  // ...other fields
}

interface UseRankedCreatorsOptions {
  filters?: Record<string, any>;
  pageSize?: number;
}

export function useRankedCreators({ filters = {}, pageSize = 20 }: UseRankedCreatorsOptions = {}) {
  return useInfiniteQuery<RankedCreator[], Error>({
    queryKey: ['rankedCreators', filters],
    queryFn: async ({ pageParam = 0 }) => {
      // Replace with your actual API/GraphQL/DB call
      const params = new URLSearchParams({ ...filters, offset: pageParam, limit: pageSize });
      const res = await fetch(`/api/creators?${params}`);
      if (!res.ok) throw new Error('Failed to fetch creators');
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length * pageSize;
    },
    initialPageParam: 0,
  });
}
