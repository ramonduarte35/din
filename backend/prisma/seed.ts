import { PrismaClient, CategoryType, SubscriptionTier, TransactionType, TransactionOrigin } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados Din...');

  // 1. Categorias Globais Padrão
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
  console.log(`✅ ${defaultCategories.length} categorias padrão sincronizadas.`);

  // 2. Administrador do Sistema (configurado via .env / ADMIN_EMAIL)
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@din.app').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'din_admin_password_2026';
  const password_hash = await bcrypt.hash(adminPassword, 10);

  // Verifica se já existe o adminEmail ou migra o demo@din.app se existir
  let demoUser = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!demoUser) {
    const legacyDemo = await prisma.user.findUnique({ where: { email: 'demo@din.app' } });
    if (legacyDemo) {
      demoUser = await prisma.user.update({
        where: { id: legacyDemo.id },
        data: {
          email: adminEmail,
          name: 'Administrador Din',
          role: 'ADMIN',
          subscription_tier: SubscriptionTier.PRO,
          password_hash,
        },
      });
      console.log(`✅ Conta legada atualizada para o Administrador: ${adminEmail}`);
    } else {
      demoUser = await prisma.user.create({
        data: {
          name: 'Administrador Din',
          email: adminEmail,
          password_hash,
          phone_number: null,
          subscription_tier: SubscriptionTier.PRO,
          role: 'ADMIN',
        },
      });
      console.log(`✅ Administrador criado: ${adminEmail}`);
    }

    // Buscar categorias para criar transações de exemplo se for um novo usuário
    const categories = await prisma.category.findMany();
    const catSalary = categories.find((c) => c.name === 'Salário');
    const catFood = categories.find((c) => c.name === 'Alimentação');
    const catTransport = categories.find((c) => c.name === 'Transporte');
    const catHousing = categories.find((c) => c.name === 'Moradia');
    const catFreelance = categories.find((c) => c.name === 'Freelance & Extras');
    const catLeisure = categories.find((c) => c.name === 'Lazer & Cultura');

    const now = new Date();
    const demoTransactions = [
      {
        description: 'Salário Mensal',
        amount: 5800.0,
        type: TransactionType.INCOME,
        category_id: catSalary?.id,
        origin: TransactionOrigin.MANUAL,
        date: new Date(now.getFullYear(), now.getMonth(), 5),
      },
      {
        description: 'Projeto Freelance Landing Page',
        amount: 1450.0,
        type: TransactionType.INCOME,
        category_id: catFreelance?.id,
        origin: TransactionOrigin.WHATSAPP_TEXT,
        received_on_number: '5586988881111',
        raw_message: 'recebi 1450 do freela da landing page',
        date: new Date(now.getFullYear(), now.getMonth(), 12),
      },
      {
        description: 'Aluguel e Condomínio',
        amount: 1850.0,
        type: TransactionType.EXPENSE,
        category_id: catHousing?.id,
        origin: TransactionOrigin.MANUAL,
        date: new Date(now.getFullYear(), now.getMonth(), 10),
      },
      {
        description: 'Supermercado Mensal',
        amount: 680.45,
        type: TransactionType.EXPENSE,
        category_id: catFood?.id,
        origin: TransactionOrigin.WHATSAPP_TEXT,
        received_on_number: '5586988881111',
        raw_message: 'gastei 680,45 no supermercado hoje',
        date: new Date(now.getFullYear(), now.getMonth(), 14),
      },
      {
        description: 'Combustível Posto Ipiranga',
        amount: 220.0,
        type: TransactionType.EXPENSE,
        category_id: catTransport?.id,
        origin: TransactionOrigin.WHATSAPP_TEXT,
        received_on_number: '5586988882222',
        raw_message: 'coloquei 220 conto de gasolina',
        date: new Date(now.getFullYear(), now.getMonth(), 18),
      },
      {
        description: 'Cinema e Jantar no Fim de Semana',
        amount: 175.5,
        type: TransactionType.EXPENSE,
        category_id: catLeisure?.id,
        origin: TransactionOrigin.WHATSAPP_TEXT,
        received_on_number: '5586988881111',
        raw_message: 'gastei 175.50 no cinema e restaurante ontem à noite',
        date: new Date(now.getFullYear(), now.getMonth(), 20),
      },
    ];

    // Garantir contas bancárias para o usuário
    let bbAccount = await prisma.account.findFirst({
      where: { user_id: demoUser.id, name: 'Banco do Brasil' },
    });
    if (!bbAccount) {
      bbAccount = await prisma.account.create({
        data: {
          user_id: demoUser.id,
          name: 'Banco do Brasil',
          type: 'CHECKING',
          color: '#facc15',
          icon: 'Landmark',
          initial_balance: 1000,
          is_default: true,
        },
      });
    }

    let nuAccount = await prisma.account.findFirst({
      where: { user_id: demoUser.id, name: 'Nubank' },
    });
    if (!nuAccount) {
      nuAccount = await prisma.account.create({
        data: {
          user_id: demoUser.id,
          name: 'Nubank',
          type: 'CHECKING',
          color: '#8b5cf6',
          icon: 'CreditCard',
          initial_balance: 500,
          is_default: false,
        },
      });
    }

    for (const t of demoTransactions) {
      const isBB = t.description.includes('Salário') || t.description.includes('Aluguel');
      await prisma.transaction.create({
        data: {
          ...t,
          user_id: demoUser.id,
          account_id: isBB ? bbAccount.id : nuAccount.id,
        },
      });
    }
    console.log(`✅ Administrador criado (${adminEmail}) com transações e contas bancárias (Banco do Brasil e Nubank).`);
  } else {
    demoUser = await prisma.user.update({
      where: { id: demoUser.id },
      data: {
        role: 'ADMIN',
        subscription_tier: SubscriptionTier.PRO,
        password_hash,
      },
    });

    // Garantir contas para usuário existente
    const userAccs = await prisma.account.findMany({ where: { user_id: demoUser.id } });
    if (userAccs.length === 0) {
      await prisma.account.create({
        data: {
          user_id: demoUser.id,
          name: 'Banco do Brasil',
          type: 'CHECKING',
          color: '#facc15',
          icon: 'Landmark',
          initial_balance: 1000,
          is_default: true,
        },
      });
      await prisma.account.create({
        data: {
          user_id: demoUser.id,
          name: 'Nubank',
          type: 'CHECKING',
          color: '#8b5cf6',
          icon: 'CreditCard',
          initial_balance: 500,
          is_default: false,
        },
      });
      console.log(`✅ Contas Banco do Brasil e Nubank criadas para ${adminEmail}.`);
    }
    console.log(`✅ Administrador ${adminEmail} atualizado com permissão ADMIN.`);
  }

  console.log('🎉 Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
