import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtRefreshGuard, RefreshRequest } from './guards/jwt-refresh.guard'; // Из будущего PR

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // (Здесь остается ваш login из другого PR, мы его не трогаем)

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard) // Гард проверит подпись и положит данные в req
  async refresh(@Req() req: RefreshRequest) {
    return this.authService.refresh(req.user!.sub, req.refreshToken!);
  }
}
