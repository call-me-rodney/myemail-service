import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
//import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
//import configuration from './config/configuration';

@Module({
  imports: [
    EmailModule, 
    AuthModule, 
    UsersModule, 
    ContactsModule,
    AnalyticsModule,
    JwtModule.register({
      global: true,
      secret: "test_secret_key",
      signOptions: { expiresIn: '1d' },
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
    // ConfigModule.forRoot({ 
    //   isGlobal: true,
    //   load: [configuration],
    //   cache: true,
    // }), 
    // SequelizeModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     dialect: 'postgres',
    //     host: configService.get('database.host'),
    //     port: configService.get('database.port'),
    //     username: configService.get('database.username'),
    //     password: configService.get('database.password'),
    //     database: configService.get('database.database'),
    //     models: [],
    //     autoLoadModels: true,
    //     synchronize: true,
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
