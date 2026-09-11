import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Profil de l\'utilisateur connecté' })
  getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Mettre à jour le profil' })
  updateProfile(@Request() req: any, @Body() body: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Post('me/kyc')
  @ApiOperation({ summary: 'Soumettre les documents KYC' })
  submitKyc(@Request() req: any, @Body() body: SubmitKycDto) {
    return this.usersService.submitKyc(req.user.id, body);
  }

  @Get('me/circles')
  @ApiOperation({ summary: 'Mes cercles' })
  getMyCircles(@Request() req: any) {
    return this.usersService.getMembershipSummary(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Profil d\'un utilisateur (pour les membres du même cercle)' })
  getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
