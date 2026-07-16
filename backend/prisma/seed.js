import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@sportsportal.gov.pk';
  const adminPassword = 'AdminSecurePassword123!';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: adminEmail,
    },
  });

  if (existingAdmin) {
    console.log(`GOVERNMENT_ADMIN user already exists: ${existingAdmin.email}`);
    return;
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      role: 'GOVERNMENT_ADMIN',
    },
  });

  console.log('Database seeded successfully!');
  console.log('Created GOVERNMENT_ADMIN User:');
  console.log(`- Email: ${admin.email}`);
  console.log(`- Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
