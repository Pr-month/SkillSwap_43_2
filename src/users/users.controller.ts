import {
  Controller,
  Patch,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
