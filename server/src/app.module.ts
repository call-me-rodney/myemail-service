import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { CompanyModule } from './company/company.module';
import configuration from './common/config/configuration';

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Dev reads from .env file; demo/prod rely on platform-injected env vars
      envFilePath: isDev ? '.env' : undefined,
      ignoreEnvFile: !isDev,
      load: [configuration],
      cache: true,
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: (configService.get<string>('jwt.expiration') || '24h') as any },
      }),
      inject: [ConfigService],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('environment');
        const base = {
          dialect: 'postgres' as const,
          models: [],
          autoLoadModels: true,
          synchronize: true,
          logging: false,
        };

        if (env === 'production') {
          return {
            ...base,
            url: configService.get<string>('database.url'),
          };
        }

        return {
          ...base,
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.name'),
        };
      },
      inject: [ConfigService],
    }),
    EmailModule,
    AuthModule,
    UsersModule,
    ContactsModule,
    AnalyticsModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
