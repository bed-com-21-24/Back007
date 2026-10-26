import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('auth')
@ApiTags('authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change the current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  changePassword(
    @Req() req: { user: { id: number } },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

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
  @ApiOperation({ summary: 'Get password recovery availability instructions' })
  @ApiResponse({
    status: 201,
    description: 'Instructions explain that email recovery is unavailable',
  })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset the current user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  resetPassword(
    @Req() req: { user: { id: number } },
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(resetPasswordDto, req.user.id);
  }
}
