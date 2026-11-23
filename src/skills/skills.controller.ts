import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedSkillsResponseDto } from './dto/skill-response.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { JwtPayload } from '../auth/auth.types';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

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
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(+id, updateSkillDto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<{ id: number }> {
    return this.skillsService.remove(id, req.user.sub);
  }
}
