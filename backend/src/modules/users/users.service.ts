import { prisma } from '../../lib/prisma.js';
import { UpdateProfileInput } from './users.schemas.js';
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
        updated_at: true,
      },
    });

    return updatedUser;
  }
}
