import { PrismaClient, CategoryType, Role, SubscriptionTier } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inicializando banco de dados do Din...');

  // 1. Categorias Globais Padrão (user_id: null)
  const defaultCategories = [
    { name: 'Alimentação', type: CategoryType.EXPENSE, icon: 'Utensils', color: '#f97316' },
    { name: 'Moradia', type: CategoryType.EXPENSE, icon: 'Home', color: '#6366f1' },
    { name: 'Transporte', type: CategoryType.EXPENSE, icon: 'Car', color: '#0ea5e9' },
    { name: 'Saúde', type: CategoryType.EXPENSE, icon: 'HeartPulse', color: '#ec4899' },
    { name: 'Lazer & Cultura', type: CategoryType.EXPENSE, icon: 'Gamepad2', color: '#a855f7' },
    { name: 'Educação', type: CategoryType.EXPENSE, icon: 'GraduationCap', color: '#14b8a6' },
    { name: 'Vestuário', type: CategoryType.EXPENSE, icon: 'ShoppingBag', color: '#f43f5e' },
    { name: 'Assinaturas & Serviços', type: CategoryType.EXPENSE, icon: 'CreditCard', color: '#8b5cf6' },
    { name: 'Outros (Despesas)', type: CategoryType.EXPENSE, icon: 'MoreHorizontal', color: '#64748b' },
    { name: 'Salário', type: CategoryType.INCOME, icon: 'Briefcase', color: '#10b981' },
    { name: 'Investimentos', type: CategoryType.INCOME, icon: 'TrendingUp', color: '#06b6d4' },
    { name: 'Freelance & Extras', type: CategoryType.INCOME, icon: 'Sparkles', color: '#eab308' },
    { name: 'Vendas & Reembolsos', type: CategoryType.INCOME, icon: 'Receipt', color: '#22c55e' },
    { name: 'Outros (Receitas)', type: CategoryType.INCOME, icon: 'Wallet', color: '#84cc16' },
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, user_id: null },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          user_id: null,
        },
      });
    }
  }
  console.log(`✅ ${defaultCategories.length} categorias globais sincronizadas com sucesso.`);

  // 2. Administrador do Sistema (Único usuário pré-injetado, originário do .env)
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@din.app').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'din_admin_password_2026';
  const password_hash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Administrador Din',
        email: adminEmail,
        password_hash,
        role: Role.ADMIN,
        subscription_tier: SubscriptionTier.PRO,
      },
    });
    console.log(`✅ Usuário Administrador criado com sucesso: ${adminEmail}`);
  } else {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        role: Role.ADMIN,
        subscription_tier: SubscriptionTier.PRO,
      },
    });
    console.log(`✅ Administrador existente atualizado: ${adminEmail}`);
  }

  console.log('✨ Seed finalizado com sucesso! (Nenhum dado fake ou usuário demo injetado).');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
