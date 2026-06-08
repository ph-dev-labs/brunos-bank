const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function generateCardNumber() {
  return "4" + Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join("");
}

async function main() {
  // Clear existing data
  await prisma.otpCode.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.card.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Admin user — NO bank account (administrative only)
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@bank.com",
      password: adminPassword,
      role: "admin",
    },
  });

  // Demo user
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      password: userPassword,
      role: "user",
      accounts: {
        create: {
          accountNumber: generateAccountNumber(),
          balance: 5000.00, // $5,000
          type: "savings",
        },
      },
      cards: {
        create: {
          cardNumber: generateCardNumber(),
          cardHolder: "JOHN DOE",
          expiry: "12/27",
          cvv: "123",
          type: "debit",
        },
      },
      notifications: {
        create: [
          {
            title: "Welcome to Standard Chartered!",
            message: "Your account has been created successfully. Start banking with ease.",
            read: false,
          },
          {
            title: "Account Funded",
            message: "Your savings account has been credited with $5,000.00",
            read: false,
          },
        ],
      },
    },
  });

  // Second demo user
  const user2Password = await bcrypt.hash("user123", 10);
  const user2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane@example.com",
      password: user2Password,
      role: "user",
      accounts: {
        create: {
          accountNumber: generateAccountNumber(),
          balance: 2500.00, // $2,500
          type: "savings",
        },
      },
      cards: {
        create: {
          cardNumber: generateCardNumber(),
          cardHolder: "JANE SMITH",
          expiry: "06/28",
          cvv: "456",
          type: "debit",
        },
      },
      notifications: {
        create: [
          {
            title: "Welcome to Standard Chartered!",
            message: "Your account has been created successfully. Start banking with ease.",
            read: false,
          },
        ],
      },
    },
  });

  const account = await prisma.account.findFirst({ where: { userId: user.id } });
  const account2 = await prisma.account.findFirst({ where: { userId: user2.id } });

  // Sample transactions between users (not admin)
  await prisma.transaction.createMany({
    data: [
      {
        amount: 1500.00,
        type: "deposit",
        description: "Initial deposit",
        status: "completed",
        receiverId: account.id,
      },
      {
        amount: 250.00,
        type: "transfer",
        description: "Rent payment",
        status: "completed",
        senderId: account.id,
        receiverId: account2.id,
      },
      {
        amount: 50.00,
        type: "transfer",
        description: "Dinner split",
        status: "completed",
        senderId: account2.id,
        receiverId: account.id,
      },
    ],
  });

  console.log("✅ Database seeded successfully");
  console.log("Admin:  admin@bank.com / admin123 (no bank account)");
  console.log("User 1: john@example.com / user123");
  console.log("User 2: jane@example.com / user123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
