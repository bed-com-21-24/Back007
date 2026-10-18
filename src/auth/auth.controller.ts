import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a user account' })
  @ApiResponse({ status: 201, description: 'Account registered successfully' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in and obtain an access token' })
  @ApiResponse({ status: 201, description: 'User authenticated successfully' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out the current session' })
  @ApiResponse({ status: 201, description: 'Logged out successfully' })
  logout() {
    return this.authService.logout();
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset' })
  @ApiResponse({ status: 201, description: 'Password reset request accepted' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset a password' })
  @ApiResponse({ status: 201, description: 'Password reset successfully' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}