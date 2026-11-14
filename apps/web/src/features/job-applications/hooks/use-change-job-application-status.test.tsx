import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { jobApplicationsApi } from '../api/job-applications-api';
import { buildJobApplication } from '../test-utils/build-job-application';
import type { JobApplication } from '../types/job-application';
import { jobApplicationKeys, useChangeJobApplicationStatus } from './use-job-applications';

vi.mock('../api/job-applications-api', () => ({
  jobApplicationsApi: { update: vi.fn(), list: vi.fn() },
}));

const boardKey = jobApplicationKeys.list({});
const wishlistKey = jobApplicationKeys.list({ status: 'WISHLIST' });
const storedApplication = buildJobApplication({ id: 'application-1', status: 'WISHLIST' });

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  queryClient.setQueryData(boardKey, [storedApplication]);
  queryClient.setQueryData(wishlistKey, [storedApplication]);
  vi.mocked(jobApplicationsApi.list).mockReturnValue(new Promise(() => {}));

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useChangeJobApplicationStatus(), { wrapper });
  return { queryClient, result };
}

describe('useChangeJobApplicationStatus', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('moves the card in every cached list before the server answers', async () => {
    vi.mocked(jobApplicationsApi.update).mockReturnValue(new Promise(() => {}));
    const { queryClient, result } = setup();

    act(() => result.current.mutate({ id: 'application-1', status: 'INTERVIEW' }));

    await waitFor(() => {
      expect(queryClient.getQueryData<JobApplication[]>(boardKey)?.[0].status).toBe('INTERVIEW');
    });
    expect(queryClient.getQueryData(wishlistKey)).toEqual([]);
  });

  it('restores every cached list when the server rejects the change', async () => {
    vi.mocked(jobApplicationsApi.update).mockRejectedValue(new Error('Server unavailable'));
    const { queryClient, result } = setup();

    act(() => result.current.mutate({ id: 'application-1', status: 'OFFER' }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(boardKey)).toEqual([storedApplication]);
    expect(queryClient.getQueryData(wishlistKey)).toEqual([storedApplication]);
  });
});
