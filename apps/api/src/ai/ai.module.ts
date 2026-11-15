import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { anthropicClientProvider } from './anthropic-client.provider';

@Module({
  controllers: [AiController],
  providers: [AiService, anthropicClientProvider],
  exports: [AiService],
})
export class AiModule {}
