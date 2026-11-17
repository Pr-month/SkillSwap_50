import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Req,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessTokenGuard } from '../auth/access-token.guard';
import type { AuthRequest } from '../auth/auth.types';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  findMe(@Req() req: AuthRequest) {
    return this.usersService.findMe(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('me')
  update(@Req() req: AuthRequest, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.sub, updateUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('me/password')
  updatePassword(
    @Req() req: AuthRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(req.user.sub, updatePasswordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
