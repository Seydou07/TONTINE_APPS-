import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Vérifier si le numéro existe déjà
    const existing = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (existing) {
      throw new ConflictException('Ce numéro de téléphone est déjà inscrit');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        phoneNumber: dto.phoneNumber,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: `${dto.firstName} ${dto.lastName}`,
      },
    });

    return this.generateTokens(user.id, user.phoneNumber);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (!user) {
      throw new UnauthorizedException('Numéro ou mot de passe incorrect');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Numéro ou mot de passe incorrect');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Compte suspendu');
    }

    return this.generateTokens(user.id, user.phoneNumber);
  }

  async verifyOtp(dto: VerifyOtpDto) {
    // TODO: Intégrer un vrai service SMS (Orangle/Moov)
    // Pour le dev, on accepte "123456" comme code OTP
    if (dto.code !== '123456') {
      throw new UnauthorizedException('Code OTP invalide');
    }

    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isPhoneVerified: true },
    });

    return { verified: true };
  }

  async refreshTokens(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }

    // Supprimer l'ancien refresh token
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.generateTokens(stored.user.id, stored.user.phoneNumber);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { ok: true };
  }

  private async generateTokens(userId: string, phoneNumber: string) {
    const payload = { sub: userId, phone: phoneNumber };

    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: '7d',
    });

    // Stocker le refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
