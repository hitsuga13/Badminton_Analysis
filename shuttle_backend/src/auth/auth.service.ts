import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../prisma/prisma.service';

const scrypt = promisify(scryptCallback);
const sessionDays = 7;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(data: { email: string; password: string; name: string; role?: string }) {
    const email = this.normalizeEmail(data.email);
    const name = data.name?.trim();
    const role = data.role?.trim() || 'coach';

    if (!email || !name || !data.password) {
      throw new BadRequestException('Email, name and password are required.');
    }

    if (data.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email is already registered.');

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        role,
        passwordHash: await this.hashPassword(data.password),
      },
    });

    return this.createSessionResponse(user);
  }

  async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: this.normalizeEmail(data.email) },
    });

    if (!user || !(await this.verifyPassword(data.password ?? '', user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.createSessionResponse(user);
  }

  async me(token: string) {
    const session = await this.findValidSession(token);
    return { user: this.publicUser(session.user) };
  }

  async logout(token: string) {
    await this.prisma.authSession.deleteMany({ where: { tokenHash: this.hashToken(token) } });
    return { loggedOut: true };
  }

  private async createSessionResponse(user: { id: number; email: string; name: string; role: string }) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);

    await this.prisma.authSession.create({
      data: {
        tokenHash: this.hashToken(token),
        userId: user.id,
        expiresAt,
      },
    });

    return {
      token,
      expiresAt,
      user: this.publicUser(user),
    };
  }

  private async findValidSession(token: string) {
    const session = await this.prisma.authSession.findUnique({
      where: { tokenHash: this.hashToken(token) },
      include: { user: true },
    });

    if (!session || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Session expired or invalid.');
    }

    return session;
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  private async verifyPassword(password: string, storedHash: string) {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;

    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    const storedKey = Buffer.from(key, 'hex');
    return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private normalizeEmail(email?: string) {
    return email?.trim().toLowerCase() ?? '';
  }

  private publicUser(user: { id: number; email: string; name: string; role: string }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
