import { describe, expect, it } from 'vitest';
import { registerSchema, toRegisterPayload } from './register-schema';

const validValues = {
  name: '',
  email: 'jane@example.com',
  password: 'long enough password',
  confirmPassword: 'long enough password',
};

describe('registerSchema', () => {
  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse(validValues).success).toBe(true);
  });

  it('reports mismatched passwords on the confirmation field', () => {
    const validation = registerSchema.safeParse({ ...validValues, confirmPassword: 'different' });

    expect(validation.error?.issues).toEqual([
      expect.objectContaining({ path: ['confirmPassword'], message: 'Passwords do not match' }),
    ]);
  });

  it('rejects passwords shorter than the minimum length', () => {
    const validation = registerSchema.safeParse({
      ...validValues,
      password: 'short',
      confirmPassword: 'short',
    });

    expect(validation.error?.issues[0].path).toEqual(['password']);
  });
});

describe('toRegisterPayload', () => {
  it('drops the confirmation field and an empty name', () => {
    expect(toRegisterPayload(validValues)).toEqual({
      email: 'jane@example.com',
      password: 'long enough password',
      name: undefined,
    });
  });
});
