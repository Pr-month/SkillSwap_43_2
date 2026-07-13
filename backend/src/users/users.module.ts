import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from '../config/app.config';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CategoriesModule } from '../categories/categories.module';
import { City } from '../cities/entities/city.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, City]),
    ConfigModule.forFeature(appConfig),
    CategoriesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
