import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { Status } from './requests.enums';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
  ) {}

  create() {
    return 'This action adds a new request';
  }

  findAll() {
    return `This action returns all requests`;
  }

  async findIncoming(userId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: [
        { receiver: { id: userId }, status: Status.PENDING },
        { receiver: { id: userId }, status: Status.INPROGRESS },
      ],
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
    });
  }

  async findOutgoing(userId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: [
        { sender: { id: userId }, status: Status.PENDING },
        { sender: { id: userId }, status: Status.INPROGRESS },
      ],
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  update(id: number) {
    return `This action updates a #${id} request`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }
}
