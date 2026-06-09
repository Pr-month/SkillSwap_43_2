import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request as Req,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IAuthorizedRequest } from '../auth/auth.types';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create() {
    return this.requestsService.create();
  }

  @Get()
  findAll() {
    return this.requestsService.findAll();
  }

  @Get('incoming')
  @UseGuards(JwtAuthGuard)
  async findIncoming(@Req() req: IAuthorizedRequest) {
    return this.requestsService.findIncoming(req.user.sub);
  }

  @Get('outgoing')
  @UseGuards(JwtAuthGuard)
  async findOutgoing(@Req() req: IAuthorizedRequest) {
    return this.requestsService.findOutgoing(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.requestsService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestsService.remove(+id);
  }
}
