import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { RegisterInput, LoginInput } from './auth.schemas.js';
import { normalizePhoneNumber } from '../../utils/phone.js';
import { SubscriptionTier } from '@prisma/client';

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

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash,
        phone_number: normalizedPhone,
        subscription_tier: SubscriptionTier.PRO, // Concede Pro por padrão no cadastro para melhor experiência de teste
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
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw { statusCode: 401, message: 'E-mail ou senha incorretos.' };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!passwordMatch) {
      throw { statusCode: 401, message: 'E-mail ou senha incorretos.' };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      subscription_tier: user.subscription_tier,
      role: user.role,
    };
  }
}
