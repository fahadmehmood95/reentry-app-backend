import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../users/entities/user.entity';
import { UserRole, UserStatus } from '../../common/enums';

export async function seedAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  console.log('Creating admin...');

  const existingAdmin = await userRepository.findOne({
    where: {
      email: 'admin@reentry.com',
    },
  });

  if (existingAdmin) {
    console.log('Admin already exists');
    return;
  }

  const password = await bcrypt.hash('Admin@123', 10);

  const admin = userRepository.create({
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@reentry.com',
    password,
    role: UserRole.ADMIN,
    phoneNumber: '+923001234567',
    status: UserStatus.ACTIVE,
  });

  await userRepository.save(admin);

  console.log('Admin created successfully');
}
