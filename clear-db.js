const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Load .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) {
    let value = val.join('=').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key.trim()] = value;
  }
});


const prisma = new PrismaClient();

async function clearDb() {
  console.log('🔍 Finding admin users to preserve...');
  const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true, name: true, email: true } });
  console.log(`✅ Keeping ${admins.length} admin(s):`, admins.map(a => a.email).join(', '));

  const adminIds = admins.map(a => a.id);

  console.log('\n🗑️  Deleting all transactions...');
  const txDel = await prisma.transaction.deleteMany({});
  console.log(`   Deleted ${txDel.count} transactions`);

  console.log('🗑️  Deleting all notifications...');
  const notifDel = await prisma.notification.deleteMany({});
  console.log(`   Deleted ${notifDel.count} notifications`);

  console.log('🗑️  Deleting all loans...');
  const loanDel = await prisma.loan.deleteMany({});
  console.log(`   Deleted ${loanDel.count} loans`);

  console.log('🗑️  Deleting all cards...');
  const cardDel = await prisma.card.deleteMany({});
  console.log(`   Deleted ${cardDel.count} cards`);

  console.log('🗑️  Deleting all IMF codes...');
  const imfDel = await prisma.imfCode.deleteMany({});
  console.log(`   Deleted ${imfDel.count} IMF codes`);

  console.log('🗑️  Deleting all Tax codes...');
  const taxDel = await prisma.taxCode.deleteMany({});
  console.log(`   Deleted ${taxDel.count} Tax codes`);

  console.log('🗑️  Deleting all COT codes...');
  const cotDel = await prisma.cotCode.deleteMany({});
  console.log(`   Deleted ${cotDel.count} COT codes`);

  console.log('🗑️  Deleting all OTP codes...');
  const otpDel = await prisma.otpCode.deleteMany({});
  console.log(`   Deleted ${otpDel.count} OTP codes`);

  console.log('🗑️  Deleting all accounts (non-admin)...');
  const acctDel = await prisma.account.deleteMany({ where: { userId: { notIn: adminIds } } });
  console.log(`   Deleted ${acctDel.count} accounts`);

  console.log('🗑️  Deleting all non-admin users...');
  const userDel = await prisma.user.deleteMany({ where: { role: { not: 'admin' } } });
  console.log(`   Deleted ${userDel.count} users`);

  console.log('\n✅ Done! Database cleared. Admins preserved:');
  admins.forEach(a => console.log(`   👤 ${a.name} (${a.email})`));
}

clearDb()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
