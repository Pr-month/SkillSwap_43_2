import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return {
      message: 'This action adds a new user',
      payload: createUserDto,
    };
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(
        `Невозможно обновить данные: пользователь с id ${id} не найден`,
      );
    }
    const newUser = {
      ...user,
      ...updateUserDto,
    };
    return await this.usersRepository.save(newUser);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
