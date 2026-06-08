const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const tables = [
    'User',
    'Account',
    'Transaction',
    'Loan',
    'Card',
    'Notification',
    'OtpCode'
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`Enabled RLS on ${table}`);
    } catch (e) {
      console.error(`Failed to enable RLS on ${table}:`, e.message);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
