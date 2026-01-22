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
import * as path from 'path';

@Module({
  imports: [
    // ConfigModule.forRoot({ 
    //   isGlobal: true,
    //   envFilePath: path.resolve(process.cwd(),'dev.env'),
    //   cache: true,
    // }),
    // ConfigModule.forRoot({ for production environment
    //   isGlobal: true,
    //   ignoreEnvFile: true,
    // }),
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     global: true,
    //     secret: configService.get<string>('JWT_SECRET') || 'default',
    //     signOptions: { expiresIn: configService.get<any>('JWT_EXPIRATION') || '1d'},
    //   }),
    //   inject: [ConfigService],
    // }),
    JwtModule.register({
      global: true,
      secret: 'default',
      signOptions: { expiresIn: '1d'},
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'myemail_service',
      models: [],
      autoLoadModels: true,
      synchronize: true,
    }),
    // SequelizeModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     dialect: configService.get('DATABASE_DIALECT'),
    //     host: configService.get('DATABASE_HOST'),
    //     port: configService.get('DATABASE_PORT'),
    //     username: configService.get('DATABASE_USERNAME'),
    //     password: configService.get('DATABASE_PASSWORD'),
    //     database: configService.get('DATABASE_NAME'),
    //     models: [],
    //     autoLoadModels: true,
    //     synchronize: true,
    //   }),
    //   inject: [ConfigService],
    // }),
    EmailModule, 
    AuthModule, 
    UsersModule, 
    ContactsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
