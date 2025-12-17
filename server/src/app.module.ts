import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { Email } from './email/email.model';
import configuration from './config/configuration';

@Module({
  imports: [
    EmailModule, 
    AuthModule, 
    UsersModule, 
    ContactsModule,
    AnalyticsModule,
    ConfigModule.forRoot({ 
      isGlobal: true,
      load: [configuration],
      cache: true,
    }), 
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: configuration.database.host,
      port: configuration.database.port,
      username: configuration.database.username,
      password: configuration.database.password,
      database: configuration.database.database,
      models: [Email],}),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
