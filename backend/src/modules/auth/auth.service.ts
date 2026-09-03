import bcrypt from 'bcryptjs';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../lib/prisma.js';
import { RegisterInput, LoginInput } from './auth.schemas.js';
import { normalizePhoneNumber } from '../../utils/phone.js';
import { SubscriptionTier, Role } from '@prisma/client';
import { env } from '../../config/env.js';

export class AuthService {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID ? env.GOOGLE_CLIENT_ID.trim() : undefined);
  }

  async register(data: RegisterInput) {
    const cleanEmail = data.email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
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
    const isAdminEmail = cleanEmail === env.ADMIN_EMAIL.trim().toLowerCase();

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: cleanEmail,
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
        avatar_url: true,
        subscription_tier: true,
        role: true,
        theme: true,
        created_at: true,
      },
    });

    return {
      ...user,
      has_password: true,
    };
  }

  async login(data: LoginInput) {
    const cleanEmail = data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw { statusCode: 401, message: 'E-mail ou senha incorretos.' };
    }

    if (!user.password_hash) {
      throw {
        statusCode: 400,
        message: 'Esta conta foi criada com o Google. Por favor, utilize o botão "Entrar com Google" ou defina uma senha no seu perfil.',
      };
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
      avatar_url: user.avatar_url,
      subscription_tier: user.subscription_tier,
      role: currentRole,
      theme: user.theme || 'dark',
      has_password: true,
    };
  }

  async googleLogin(idToken: string) {
    let payload: {
      email?: string;
      email_verified?: boolean | string;
      name?: string;
      sub?: string;
      picture?: string;
      aud?: string;
    } | undefined;

    const trimmedClientId = env.GOOGLE_CLIENT_ID ? env.GOOGLE_CLIENT_ID.trim() : undefined;

    // Tentativa 1: Verificação criptográfica local via google-auth-library
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: idToken.trim(),
        audience: trimmedClientId,
      });
      payload = ticket.getPayload();
    } catch (err: any) {
      console.warn('⚠️ Falha na verificação local do token Google, verificando via endpoint tokeninfo:', err?.message || err);
      // Tentativa 2: Consulta direta ao endpoint oficial tokeninfo do Google
      try {
        const response = await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`,
          { timeout: 8000 }
        );
        if (response.data && response.data.email) {
          if (trimmedClientId && response.data.aud !== trimmedClientId) {
            console.error(`Token aud (${response.data.aud}) não coincide com GOOGLE_CLIENT_ID configurado (${trimmedClientId}).`);
            throw new Error('Token audience mismatch');
          }
          payload = response.data;
        }
      } catch (fallbackErr: any) {
        console.error('❌ Erro na validação final do token Google:', fallbackErr?.response?.data || fallbackErr?.message || fallbackErr);
        throw { statusCode: 401, message: 'Token de autenticação do Google inválido ou expirado.' };
      }
    }

    if (!payload || !payload.email) {
      throw { statusCode: 400, message: 'Não foi possível obter os dados do usuário do Google.' };
    }

    const isEmailVerified = payload.email_verified === true || payload.email_verified === 'true';
    if (!isEmailVerified) {
      throw { statusCode: 400, message: 'O e-mail da sua conta Google não está verificado.' };
    }

    const cleanEmail = payload.email.trim().toLowerCase();
    const googleId = payload.sub || '';
    const name = payload.name || cleanEmail.split('@')[0];
    const avatarUrl = payload.picture || null;
    const isAdminEmail = cleanEmail === env.ADMIN_EMAIL.trim().toLowerCase();


    // Busca usuário existente por google_id ou por email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { google_id: googleId },
          { email: cleanEmail },
        ],
      },
    });

    if (user) {
      // Atualiza google_id, avatar_url ou role se necessário
      const dataToUpdate: any = {};
      if (!user.google_id) {
        dataToUpdate.google_id = googleId;
      }
      if (!user.avatar_url && avatarUrl) {
        dataToUpdate.avatar_url = avatarUrl;
      }
      if (isAdminEmail && user.role !== Role.ADMIN) {
        dataToUpdate.role = Role.ADMIN;
        dataToUpdate.subscription_tier = SubscriptionTier.PRO;
      }

      if (Object.keys(dataToUpdate).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: dataToUpdate,
        });
      }
    } else {
      // Cria novo usuário via Google OAuth
      user = await prisma.user.create({
        data: {
          name,
          email: cleanEmail,
          google_id: googleId,
          avatar_url: avatarUrl,
          password_hash: null,
          subscription_tier: SubscriptionTier.PRO,
          role: isAdminEmail ? Role.ADMIN : Role.USER,
        },
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      avatar_url: user.avatar_url,
      subscription_tier: user.subscription_tier,
      role: user.role,
      theme: user.theme || 'dark',
      has_password: Boolean(user.password_hash),
    };
  }
}

