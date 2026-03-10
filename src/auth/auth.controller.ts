import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto } from './dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  login(@Body() dto: SignInDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      return this.authService.login(dto);
    } catch (error) {
      throw error;
    }
  }
}
