import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { Email } from './email/email.model';

@Module({
  imports: [EmailModule, AuthModule, UsersModule, ContactsModule, SequelizeModule.forRoot({dialect: 'postgres',host: 'localhost',port: 5432,username: 'postgres',password: 'postgres',database: 'myemail-service',models: [Email],}), AnalyticsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
