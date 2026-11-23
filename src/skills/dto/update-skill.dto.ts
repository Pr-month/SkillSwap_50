import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateSkillDto } from './create-skill.dto';

export class UpdateSkillDto extends PartialType(
  OmitType(CreateSkillDto, ['categoryId'] as const),
  { skipNullProperties: false },
) {}
