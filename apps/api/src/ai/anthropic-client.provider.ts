import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { EnvironmentVariables } from '../config/environment.validation';
import { ANTHROPIC_CLIENT } from './ai.constants';

/**
 * AI features are optional: without an API key the client is null and the AI endpoints
 * answer 503, while the rest of the app keeps working.
 */
export const anthropicClientProvider: Provider = {
  provide: ANTHROPIC_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService<EnvironmentVariables, true>): Anthropic | null => {
    const apiKey = configService.get('ANTHROPIC_API_KEY', { infer: true });
    return apiKey ? new Anthropic({ apiKey }) : null;
  },
};
