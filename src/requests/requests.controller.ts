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
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IAuthorizedRequest } from '../auth/auth.types';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: IAuthorizedRequest, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(req.user.sub, dto);
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
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Req() req: IAuthorizedRequest,
  ) {
    return this.requestsService.update(id, updateRequestDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: IAuthorizedRequest,
  ): Promise<void> {
    return this.requestsService.remove(id, req.user.sub);
  }
}
