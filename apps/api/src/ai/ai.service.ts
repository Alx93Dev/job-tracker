import {
  BadGatewayException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import type { z } from 'zod';
import type { EnvironmentVariables } from '../config/environment.validation';
import {
  AI_ERROR_MESSAGES,
  AI_MAX_OUTPUT_TOKENS,
  ANTHROPIC_CLIENT,
  MATCH_SCORE_RANGE,
  SERVER_SIDE_FALLBACK_BETA,
} from './ai.constants';
import { buildCvMatchUserMessage, CV_MATCH_SYSTEM_PROMPT } from './prompts/cv-match.prompt';
import {
  buildExtractJobPostingUserMessage,
  EXTRACT_JOB_POSTING_SYSTEM_PROMPT,
} from './prompts/extract-job-posting.prompt';
import { cvMatchSchema, type CvMatch } from './schemas/cv-match.schema';
import {
  extractedJobPostingSchema,
  type ExtractedJobPosting,
} from './schemas/extracted-job-posting.schema';

type Effort = 'low' | 'medium' | 'high';

interface StructuredRequest<Schema extends z.ZodType> {
  schema: Schema;
  systemPrompt: string;
  userMessage: string;
  effort: Effort;
}

interface CvMatchRequest {
  cvText: string;
  positionTitle: string;
  companyName: string;
  jobDescription: string;
}

@Injectable()
export class AiService {
  constructor(
    @Inject(ANTHROPIC_CLIENT) private readonly anthropic: Anthropic | null,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  /** Extraction is a reading task, so low effort keeps it fast and cheap. */
  extractJobPosting(postingText: string): Promise<ExtractedJobPosting> {
    return this.requestStructuredOutput({
      schema: extractedJobPostingSchema,
      systemPrompt: EXTRACT_JOB_POSTING_SYSTEM_PROMPT,
      userMessage: buildExtractJobPostingUserMessage(postingText),
      effort: 'low',
    });
  }

  async matchCv(request: CvMatchRequest): Promise<CvMatch> {
    const cvMatch = await this.requestStructuredOutput({
      schema: cvMatchSchema,
      systemPrompt: CV_MATCH_SYSTEM_PROMPT,
      userMessage: buildCvMatchUserMessage(request),
      effort: 'medium',
    });

    return {
      ...cvMatch,
      matchScore: Math.min(
        MATCH_SCORE_RANGE.max,
        Math.max(MATCH_SCORE_RANGE.min, cvMatch.matchScore),
      ),
    };
  }

  private async requestStructuredOutput<Schema extends z.ZodType>({
    schema,
    systemPrompt,
    userMessage,
    effort,
  }: StructuredRequest<Schema>): Promise<z.infer<Schema>> {
    if (!this.anthropic) {
      throw new ServiceUnavailableException(AI_ERROR_MESSAGES.notConfigured);
    }

    const response = await this.callClaude(this.anthropic, {
      model: this.configService.get('ANTHROPIC_MODEL', { infer: true }),
      max_tokens: AI_MAX_OUTPUT_TOKENS,
      betas: [SERVER_SIDE_FALLBACK_BETA],
      fallbacks: 'default',
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      output_config: { effort, format: betaZodOutputFormat(schema) },
    });

    if (response.stop_reason === 'refusal') {
      throw new UnprocessableEntityException(AI_ERROR_MESSAGES.declined);
    }
    if (response.stop_reason === 'max_tokens' || response.parsed_output === null) {
      throw new BadGatewayException(AI_ERROR_MESSAGES.incompleteAnswer);
    }

    return response.parsed_output;
  }

  private async callClaude<Params extends Anthropic.Beta.MessageCreateParamsNonStreaming>(
    anthropic: Anthropic,
    params: Params,
  ) {
    try {
      return await anthropic.beta.messages.parse(params);
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        throw new ServiceUnavailableException(AI_ERROR_MESSAGES.providerBusy);
      }
      if (error instanceof Anthropic.APIError) {
        throw new BadGatewayException(AI_ERROR_MESSAGES.providerFailed);
      }
      throw error;
    }
  }
}
