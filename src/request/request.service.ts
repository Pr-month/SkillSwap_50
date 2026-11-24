import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestStatus } from './request.enums';
import { UserRole } from '../users/users.enums';

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async create(userId: number, dto: CreateRequestDto): Promise<Request> {
    if (dto.receiverId === userId) {
      throw new BadRequestException('Cannot send request to yourself');
    }

    const [receiver, offeredSkill, requestedSkill] = await Promise.all([
      this.usersRepository.findOne({ where: { id: dto.receiverId } }),
      this.skillsRepository.findOne({
        where: { id: dto.offeredSkillId },
        relations: { owner: true },
      }),
      this.skillsRepository.findOne({
        where: { id: dto.requestedSkillId },
        relations: { owner: true },
      }),
    ]);

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }
    if (!offeredSkill) {
      throw new NotFoundException('Offered skill not found');
    }
    if (!requestedSkill) {
      throw new NotFoundException('Requested skill not found');
    }

    if (offeredSkill.owner.id !== userId) {
      throw new ForbiddenException('You can only offer your own skill');
    }
    if (requestedSkill.owner.id !== dto.receiverId) {
      throw new ForbiddenException('Requested skill must belong to receiver');
    }

    const request = this.requestsRepository.create({
      sender: { id: userId },
      receiver,
      offeredSkill,
      requestedSkill,
    });

    return this.requestsRepository.save(request);
  }

  findAll() {
    return `This action returns all request`;
  }

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request`;
  }

  async remove(
    requestId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<{ id: number }> {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
      relations: { sender: true },
    });

    if (!request) {
      throw new NotFoundException(`Request with id ${requestId} not found`);
    }

    const isSender = request.sender.id === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isSender && !isAdmin) {
      throw new ForbiddenException(
        'You can only delete requests you sent yourself',
      );
    }

    const deleted = await this.requestsRepository.remove(request);

    return { id: deleted.id };
  }

  findIncoming(userId: number): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        receiver: { id: userId },
        status: In([RequestStatus.PENDING, RequestStatus.IN_PROGRESS]),
      },
      relations: {
        sender: true,
        offeredSkill: true,
        requestedSkill: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  findOutgoing(userId: number): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        sender: { id: userId },
        status: In([RequestStatus.PENDING, RequestStatus.IN_PROGRESS]),
      },
      relations: {
        receiver: true,
        offeredSkill: true,
        requestedSkill: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    userId: number,
    requestId: number,
    status: RequestStatus,
  ): Promise<Request> {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
      relations: {
        sender: true,
        receiver: true,
        offeredSkill: true,
        requestedSkill: true,
      },
    });

    if (!request) {
      throw new NotFoundException(`Request with id ${requestId} not found`);
    }

    if (request.receiver.id !== userId) {
      throw new ForbiddenException('You can only update incoming requests');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Only pending requests can be accepted or rejected',
      );
    }

    request.status = status;
    request.isRead = true;

    return this.requestsRepository.save(request);
  }
}
