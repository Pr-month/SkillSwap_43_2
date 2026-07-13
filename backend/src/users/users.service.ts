import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { appConfig, AppConfig } from 'src/config/app.config';
import { Repository } from 'typeorm';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { CategoriesService } from '../categories/categories.service';
import { City } from '../cities/entities/city.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
    @Inject(appConfig.KEY)
    private readonly config: AppConfig,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    data: Partial<User> & { wantToLearn?: string[]; cityId?: string },
  ): Promise<User> {
    const { wantToLearn, cityId, ...rest } = data;
    const user = this.usersRepository.create(rest);
    if (wantToLearn && wantToLearn.length > 0) {
      user.wantToLearn = await this.categoriesService.findByIds(wantToLearn);
    }
    if (cityId) {
      const city = await this.citiesRepository.findOne({
        where: { id: cityId },
      });
      if (!city) throw new NotFoundException('City not found');
      user.cityId = city.id;
    }
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(
        `Невозможно обновить данные: пользователь с id ${id} не найден`,
      );
    }
    const { wantToLearn, cityId, ...rest } = updateUserDto;
    if (wantToLearn && wantToLearn.length > 0) {
      user.wantToLearn = await this.categoriesService.findByIds(wantToLearn);
    }
    if (cityId) {
      const city = await this.citiesRepository.findOne({
        where: { id: cityId },
      });
      if (!city) throw new NotFoundException('City not found');
      user.cityId = city.id;
    }
    return this.usersRepository.save({ ...user, ...rest });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async saveRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.usersRepository.update({ id }, { refreshToken });
  }

  async clearRefreshToken(id: string): Promise<void> {
    await this.usersRepository.update(
      { id },
      { refreshToken: null as unknown as string },
    );
  }

  async updatePassword(id: string, dto: UpdatePasswordDto): Promise<void> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) throw new NotFoundException('User not found');
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Old password is incorrect');
    user.password = await bcrypt.hash(dto.newPassword, this.config.hashSalt);
    await this.usersRepository.save(user);
  }
}
