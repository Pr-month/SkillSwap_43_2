import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { RequestStatus } from './requests.enums';
import { Roles } from '../users/users.enums';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(senderId: string, dto: CreateRequestDto): Promise<Request> {
    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });

    if (!sender) {
      throw new NotFoundException('User not found');
    }

    const offeredSkill = await this.skillsRepository.findOne({
      where: { id: dto.offeredSkillId },
      relations: { owner: true },
    });

    if (!offeredSkill) {
      throw new NotFoundException('Offered skill not found');
    }

    const requestedSkill = await this.skillsRepository.findOne({
      where: { id: dto.requestedSkillId },
      relations: { owner: true },
    });

    if (!requestedSkill) {
      throw new NotFoundException('Request skill not found');
    }
    if (offeredSkill.owner.id !== sender.id) {
      throw new ForbiddenException('You can offer only your skills');
    }

    if (requestedSkill.owner.id === sender.id) {
      throw new ForbiddenException('Cannot create request to yourself');
    }

    const request = this.requestsRepository.create({
      sender,
      receiver: requestedSkill.owner,
      offeredSkill,
      requestedSkill,
    });

    this.notificationsGateway.notifyUser(requestedSkill.owner.id, {
      notificationType: RequestStatus.NEWREQ,
      skillName: offeredSkill.title,
      fromUserId: sender.id,
      fromUserName: sender.name,
    });
    return this.requestsRepository.save(request);
  }

  findAll() {
    return `This action returns all requests`;
  }

  async findIncoming(userId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: [{ receiver: { id: userId }, status: RequestStatus.NEWREQ }],
      relations: {
        sender: true,
        receiver: true,
        offeredSkill: true,
        requestedSkill: true,
      },
    });
  }

  async findOutgoing(userId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: [{ sender: { id: userId }, status: RequestStatus.NEWREQ }],
      relations: {
        sender: true,
        receiver: true,
        offeredSkill: true,
        requestedSkill: true,
      },
    });
  }

  findOne(id: string) {
    return `This action returns a #${id} request`;
  }

  async update(
    id: string,
    updateRequestDto: UpdateRequestDto,
    userId: string,
  ): Promise<Request> {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: {
        receiver: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.receiver.id !== userId) {
      throw new ForbiddenException('You can update only incoming requests');
    }

    request.status = updateRequestDto.status;

    this.notificationsGateway.notifyUser(request.sender.id, {
      notificationType: updateRequestDto.status,
      skillName: request.requestedSkill.title,
      fromUserId: request.sender.name,
      fromUserName: request.sender.id,
    });
    return this.requestsRepository.save(request);
  }

  async remove(requestId: string, userId: string) {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
      relations: {
        sender: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Current user not found');
    }

    const isAdmin = user.role === Roles.ADMIN;

    if (!isAdmin && request.sender.id !== userId) {
      throw new ForbiddenException(
        'You can delete only your own outgoing requests',
      );
    }

    await this.requestsRepository.remove(request);
  }
}
