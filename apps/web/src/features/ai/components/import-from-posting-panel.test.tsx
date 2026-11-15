import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api-error';
import { aiApi } from '../api/ai-api';
import { ImportFromPostingPanel } from './import-from-posting-panel';

vi.mock('../api/ai-api', () => ({ aiApi: { extractJobPosting: vi.fn() } }));

function renderPanel() {
  const handleImported = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ImportFromPostingPanel onImported={handleImported} />
    </QueryClientProvider>,
  );
  return { handleImported, user: userEvent.setup() };
}

describe('ImportFromPostingPanel', () => {
  // Braces matter: Vitest runs a function returned from beforeEach as a teardown.
  beforeEach(() => {
    vi.mocked(aiApi.extractJobPosting).mockReset();
  });

  it('keeps the button disabled until a posting is pasted', async () => {
    const { user } = renderPanel();
    const extractButton = screen.getByRole('button', { name: 'Extract details' });

    expect(extractButton).toBeDisabled();
    await user.type(screen.getByLabelText('Job posting text'), 'Acme is hiring');
    expect(extractButton).toBeEnabled();
  });

  it('passes the extracted details to the form', async () => {
    vi.mocked(aiApi.extractJobPosting).mockResolvedValue({
      companyName: 'Acme',
      positionTitle: 'Frontend Developer',
      location: null,
      workMode: 'REMOTE',
      salaryRange: null,
      seniority: null,
      requiredSkills: [],
      niceToHaveSkills: [],
      summary: 'Summary',
    });
    const { handleImported, user } = renderPanel();

    await user.type(screen.getByLabelText('Job posting text'), 'Acme is hiring');
    await user.click(screen.getByRole('button', { name: 'Extract details' }));

    expect(await screen.findByText('Form filled in. Review it before saving.')).toBeVisible();
    expect(vi.mocked(aiApi.extractJobPosting).mock.calls[0][0]).toBe('Acme is hiring');
    expect(handleImported).toHaveBeenCalledWith(
      expect.objectContaining({
        companyName: 'Acme',
        location: 'Remote',
        jobDescription: 'Acme is hiring',
      }),
    );
  });

  it('shows the server error when AI is unavailable', async () => {
    vi.mocked(aiApi.extractJobPosting).mockRejectedValue(
      new ApiError(503, 'AI features are not configured on this server'),
    );
    const { handleImported, user } = renderPanel();

    await user.type(screen.getByLabelText('Job posting text'), 'Acme is hiring');
    await user.click(screen.getByRole('button', { name: 'Extract details' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'AI features are not configured on this server',
    );
    expect(handleImported).not.toHaveBeenCalled();
  });
});
