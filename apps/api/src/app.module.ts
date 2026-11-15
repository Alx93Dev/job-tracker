import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GLOBAL_RATE_LIMIT } from './auth/auth.constants';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './config/environment.validation';
import { JobApplicationsModule } from './job-applications/job-applications.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    ThrottlerModule.forRoot([{ name: 'default', ...GLOBAL_RATE_LIMIT }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    JobApplicationsModule,
    ProfileModule,
    AiModule,
    NotificationsModule,
    AnalyticsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
