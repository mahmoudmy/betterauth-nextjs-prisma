import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@example.com' },
        { username: 'admin' }
      ]
    }
  })

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists, skipping creation')
    return
  }

  await auth.api.createUser({
    body: {
      name: "Administrator",
      email: "admin@example.com",
      password: "admin123",
      data: {
        username: "admin",
      }
    }
  });

  console.log('✅ Admin user created: admin')

  await prisma.user.update({
    where: {
      username: 'admin'
    },
    data: {
      role: 'admin'
    }
  })


  console.log('✅ Admin role updated.')

  console.log('🎉 Database seeding completed successfully!')
  console.log('📧 Admin email: admin@example.com')
  console.log('🔑 Admin password: admin123')
  console.log('⚠️  Remember to change these credentials in production!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
