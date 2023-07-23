import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create.user.dto';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('signin')
  sigin(@Body() authDto: AuthDto, @Req() req, @Res() res) {
    return this.authService.signin(authDto, req, res);
  }

  @Get('signout')
  sigout(@Req() req, @Res() res) {
    return this.authService.signout(req, res);
  }
}
