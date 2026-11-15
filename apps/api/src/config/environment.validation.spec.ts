import 'reflect-metadata';
import { validateEnvironment } from './environment.validation';

const requiredVariables = {
  DATABASE_URL: 'postgresql://localhost:5432/test',
  CORS_ORIGIN: 'http://localhost:3000',
  JWT_ACCESS_SECRET: 'a-test-secret-that-is-at-least-32-characters-long',
};

describe('validateEnvironment', () => {
  it.each([
    ['false', false],
    ['true', true],
    [undefined, false],
  ])('parses COOKIE_SECURE=%s as %s', (rawValue, expectedValue) => {
    const environment = validateEnvironment({ ...requiredVariables, COOKIE_SECURE: rawValue });

    expect(environment.COOKIE_SECURE).toBe(expectedValue);
  });

  it('applies defaults and converts numeric variables', () => {
    const environment = validateEnvironment({ ...requiredVariables, PORT: '5000' });

    expect(environment.PORT).toBe(5000);
    expect(environment.ACCESS_TOKEN_TTL_SECONDS).toBe(900);
    expect(environment.REFRESH_TOKEN_TTL_DAYS).toBe(7);
  });

  it('treats an empty ANTHROPIC_API_KEY as AI disabled and defaults the model', () => {
    const environment = validateEnvironment({ ...requiredVariables, ANTHROPIC_API_KEY: '' });

    expect(environment.ANTHROPIC_API_KEY).toBeUndefined();
    expect(environment.ANTHROPIC_MODEL).toBe('claude-opus-5-5');
  });

  it('treats an empty CRON_SECRET as not configured and rejects a short one', () => {
    expect(
      validateEnvironment({ ...requiredVariables, CRON_SECRET: '' }).CRON_SECRET,
    ).toBeUndefined();
    expect(() => validateEnvironment({ ...requiredVariables, CRON_SECRET: 'short' })).toThrow(
      /CRON_SECRET/,
    );
  });

  it('rejects a JWT secret that is too short', () => {
    expect(() => validateEnvironment({ ...requiredVariables, JWT_ACCESS_SECRET: 'short' })).toThrow(
      /JWT_ACCESS_SECRET/,
    );
  });
});
