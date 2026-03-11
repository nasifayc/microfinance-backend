import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { RefreshTokenDto, SignInDto } from './dto';
import { AuthService } from './auth.service';
import { Public } from './decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: SignInDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  logout(@Req() req: { user: { userId: string } }) {
    return this.authService.logout(req.user.userId);
  }

  @Get('me')
  me(@Req() req: { user: unknown }) {
    return req.user;
  }
}
