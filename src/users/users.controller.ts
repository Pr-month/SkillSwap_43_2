import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request & { user: { sub: string } }) {
    return this.usersService.findById(req.user.sub);
  }
  
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard) // эта гарда уже создана другим участником, и я не стала создавать дубль
  async update(
    @Req()
    req: Request & {
      user: {
        sub: string;
      };
    },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const id = req.user.sub;
    return await this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  
  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  updatePassword(
    @Req() req: Request & { user: { sub: string } },
    @Body() dto: UpdatePasswordDto,
  ): Promise<void> {
    return this.usersService.updatePassword(req.user.sub, dto);
  }
}
