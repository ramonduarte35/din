import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { RegisterInput, LoginInput } from './auth.schemas.js';
import { normalizePhoneNumber } from '../../utils/phone.js';
import { SubscriptionTier, Role } from '@prisma/client';
import { env } from '../../config/env.js';

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw { statusCode: 409, message: 'E-mail já cadastrado na plataforma.' };
    }

    let normalizedPhone: string | null = null;
    if (data.phone_number) {
      normalizedPhone = normalizePhoneNumber(data.phone_number);
      const existingPhone = await prisma.user.findUnique({
        where: { phone_number: normalizedPhone },
      });
      if (existingPhone) {
        throw { statusCode: 409, message: 'Número de WhatsApp já vinculado a outra conta.' };
      }
    }

    const password_hash = await bcrypt.hash(data.password, 10);
    const isAdminEmail = data.email.trim().toLowerCase() === env.ADMIN_EMAIL.trim().toLowerCase();

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.trim().toLowerCase(),
        password_hash,
        phone_number: normalizedPhone,
        subscription_tier: SubscriptionTier.PRO,
        role: isAdminEmail ? Role.ADMIN : Role.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        subscription_tier: true,
        role: true,
        created_at: true,
      },
    });

    return user;
  }

  async login(data: LoginInput) {
    const cleanEmail = data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw { statusCode: 401, message: 'E-mail ou senha incorretos.' };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!passwordMatch) {
      throw { statusCode: 401, message: 'E-mail ou senha incorretos.' };
    }

    // Se o email coincide com o ADMIN_EMAIL do .env mas o role ainda não era ADMIN, atualiza automaticamente
    let currentRole = user.role;
    if (cleanEmail === env.ADMIN_EMAIL.trim().toLowerCase() && currentRole !== Role.ADMIN) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: Role.ADMIN, subscription_tier: SubscriptionTier.PRO },
      });
      currentRole = Role.ADMIN;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      subscription_tier: user.subscription_tier,
      role: currentRole,
    };
  }
}
