import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from './ai/ai.module';
import { GLOBAL_RATE_LIMIT } from './auth/auth.constants';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './config/environment.validation';
import { JobApplicationsModule } from './job-applications/job-applications.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    ThrottlerModule.forRoot([{ name: 'default', ...GLOBAL_RATE_LIMIT }]),
    PrismaModule,
    AuthModule,
    JobApplicationsModule,
    ProfileModule,
    AiModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
