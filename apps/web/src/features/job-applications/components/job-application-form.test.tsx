import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { JobApplicationForm } from './job-application-form';

function renderForm() {
  const handleSubmit = vi.fn();
  render(<JobApplicationForm submitLabel="Create" isSubmitting={false} onSubmit={handleSubmit} />);
  return { handleSubmit, user: userEvent.setup() };
}

describe('JobApplicationForm', () => {
  it('shows accessible errors and does not submit when required fields are empty', async () => {
    const { handleSubmit, user } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Company is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /company/i })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits a clean payload when the form is valid', async () => {
    const { handleSubmit, user } = renderForm();

    await user.type(screen.getByRole('textbox', { name: /company/i }), 'Acme');
    await user.type(screen.getByRole('textbox', { name: /position/i }), 'Frontend Developer');
    await user.selectOptions(screen.getByRole('combobox', { name: /status/i }), 'APPLIED');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        companyName: 'Acme',
        positionTitle: 'Frontend Developer',
        status: 'APPLIED',
        jobUrl: null,
      }),
    );
  });
});
