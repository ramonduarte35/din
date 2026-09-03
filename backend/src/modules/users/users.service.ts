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
        avatar_url: true,
        google_id: true,
        password_hash: true,
        subscription_tier: true,
        role: true,
        theme: true,
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

    const hasPassword = Boolean(user.password_hash);
    const { password_hash, ...userProfile } = user;

    return {
      ...userProfile,
      has_password: hasPassword,
    };
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
        ...(data.name !== undefined && { name: data.name }),
        ...(normalizedPhone !== undefined && { phone_number: normalizedPhone }),
        ...(data.theme !== undefined && { theme: data.theme }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        avatar_url: true,
        google_id: true,
        password_hash: true,
        subscription_tier: true,
        role: true,
        theme: true,
        updated_at: true,
      },
    });

    const hasPassword = Boolean(updatedUser.password_hash);
    const { password_hash, ...userProfile } = updatedUser;

    return {
      ...userProfile,
      has_password: hasPassword,
    };
  }

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado.' };
    }

    if (user.password_hash) {
      if (!data.current_password) {
        throw { statusCode: 400, message: 'A senha atual é obrigatória.' };
      }

      const passwordMatch = await bcrypt.compare(data.current_password, user.password_hash);
      if (!passwordMatch) {
        throw { statusCode: 400, message: 'A senha atual fornecida está incorreta.' };
      }

      const isSamePassword = await bcrypt.compare(data.new_password, user.password_hash);
      if (isSamePassword) {
        throw { statusCode: 400, message: 'A nova senha deve ser diferente da senha atual.' };
      }
    }

    const password_hash = await bcrypt.hash(data.new_password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash },
    });

    return {
      message: user.password_hash ? 'Senha alterada com sucesso!' : 'Senha criada com sucesso!',
    };
  }
}

