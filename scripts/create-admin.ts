/**
 * Script to create an admin user
 * Usage: npx tsx scripts/create-admin.ts
 * Or: npm run create-admin
 */

import 'dotenv/config';
import { db } from '../packages/db';
import * as argon2 from 'argon2';

async function hashAdminPassword(plain: string): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });
}

async function createAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const adminPhone = process.env.ADMIN_PHONE || null;

  console.log('🔐 [CREATE ADMIN] Starting admin user creation...');
  console.log('📧 [CREATE ADMIN] Email:', adminEmail);
  console.log('📱 [CREATE ADMIN] Phone:', adminPhone || 'not provided');

  try {
    // Check if user already exists
    const existing = await db.user.findFirst({
      where: {
        OR: [
          ...(adminEmail ? [{ email: adminEmail }] : []),
          ...(adminPhone ? [{ phone: adminPhone }] : []),
        ],
      },
      select: {
        id: true,
        email: true,
        phone: true,
        roles: true,
      },
    });

    if (existing) {
      console.log('⚠️ [CREATE ADMIN] User already exists, updating to admin...');
      
      const roles = Array.isArray(existing.roles) ? existing.roles : [];
      const hasAdmin = roles.includes('admin');
      
      if (hasAdmin) {
        console.log('✅ [CREATE ADMIN] User already has admin role');
      } else {
        const passwordHash = await hashAdminPassword(adminPassword);
        
        const updated = await db.user.update({
          where: { id: existing.id },
          data: {
            roles: [...roles, 'admin'],
            passwordHash,
          },
          select: {
            id: true,
            email: true,
            phone: true,
            roles: true,
          },
        });

        console.log('✅ [CREATE ADMIN] User updated to admin:', {
          id: updated.id,
          email: updated.email,
          phone: updated.phone,
          roles: updated.roles,
        });
      }
    } else {
      console.log('➕ [CREATE ADMIN] Creating new admin user...');
      
      const passwordHash = await hashAdminPassword(adminPassword);

      const created = await db.user.create({
        data: {
          email: adminEmail || null,
          phone: adminPhone || null,
          passwordHash,
          roles: ['admin'],
          emailVerified: true,
          locale: 'en',
        },
        select: {
          id: true,
          email: true,
          phone: true,
          roles: true,
        },
      });

      console.log('✅ [CREATE ADMIN] Admin user created successfully:', {
        id: created.id,
        email: created.email,
        phone: created.phone,
        roles: created.roles,
      });
    }

    console.log('🎉 [CREATE ADMIN] Done!');
    console.log('📝 [CREATE ADMIN] Login credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('   Phone:', adminPhone || 'not set');
  } catch (error: any) {
    console.error('❌ [CREATE ADMIN] Error:', error);
    console.error('❌ [CREATE ADMIN] Error details:', {
      message: error.message,
      code: error.code,
    });
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

createAdmin();

