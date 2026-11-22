import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedSkillsResponseDto } from './dto/skill-response.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.types';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedSkillsResponseDto> {
    const { skills, total } = await this.skillsService.findAll(paginationQuery);

    return {
      skills,
      total,
      offset: paginationQuery.offset ?? 0,
      limit: paginationQuery.limit ?? 10,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const skill = await this.skillsService.findOne(id);

    return {
      skills: [skill],
      total: 1,
      offset: 0,
      limit: 1,
    };
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Body() createSkillDto: CreateSkillDto,
  ): Promise<PaginatedSkillsResponseDto> {
    const skill = await this.skillsService.create({
      ...createSkillDto,
      authorId: req.user.sub,
    });

    return {
      skills: [skill],
      total: 1,
      offset: 0,
      limit: 1,
    };
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: JwtPayload },
    @Body() updateSkillDto: UpdateSkillDto,
  ): Promise<PaginatedSkillsResponseDto> {
    const skill = await this.skillsService.update(
      id,
      req.user.sub,
      updateSkillDto,
    );

    return {
      skills: [skill],
      total: 1,
      offset: 0,
      limit: 1,
    };
  }
}
