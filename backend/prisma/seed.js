import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@sportsportal.gov.pk';
  const adminPassword = 'admin123'; // Easy password for development/testing

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  // Upsert (update if exists, create if not) admin credentials in the database
  const admin = await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      passwordHash,
      role: 'GOVERNMENT_ADMIN',
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: 'GOVERNMENT_ADMIN',
    },
  });

  console.log('Database seeded successfully!');
  console.log('GOVERNMENT_ADMIN User Credentials Fed to Database:');
  console.log(`- Email:    ${admin.email}`);
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
