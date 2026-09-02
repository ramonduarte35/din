import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { UpdateProfileInput, ChangePasswordInput } from './users.schemas.js';
import { normalizePhoneNumber } from '../../utils/phone.js';

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        subscription_tier: true,
        role: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado.' };
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    let normalizedPhone: string | null | undefined = undefined;

    if (data.phone_number !== undefined) {
      if (data.phone_number === null || data.phone_number.trim() === '') {
        normalizedPhone = null;
      } else {
        normalizedPhone = normalizePhoneNumber(data.phone_number);
        const existing = await prisma.user.findFirst({
          where: {
            phone_number: normalizedPhone,
            NOT: { id: userId },
          },
        });

        if (existing) {
          throw {
            statusCode: 409,
            message: 'Este número de WhatsApp já está em uso por outra conta.',
          };
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone_number: normalizedPhone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        subscription_tier: true,
        role: true,
        updated_at: true,
      },
    });

    return updatedUser;
  }

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado.' };
    }

    const passwordMatch = await bcrypt.compare(data.current_password, user.password_hash);
    if (!passwordMatch) {
      throw { statusCode: 400, message: 'A senha atual fornecida está incorreta.' };
    }

    const isSamePassword = await bcrypt.compare(data.new_password, user.password_hash);
    if (isSamePassword) {
      throw { statusCode: 400, message: 'A nova senha deve ser diferente da senha atual.' };
    }

    const password_hash = await bcrypt.hash(data.new_password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash },
    });

    return { message: 'Senha alterada com sucesso!' };
  }
}

