import 'dotenv/config';
import { DataSource } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { ClientProfile } from '../profiles/entity/client.profile.entity';
import { CoachProfile } from '../profiles/entity/coach.profile.entity';
import { Document } from '../documents/entity/documents.entity';
import { RefreshToken } from '../auth/entity/refresh-token.entity';
import { VerificationToken } from '../auth/entity/verification-token.entity';

export default new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,

  port: Number(process.env.DB_PORT),

  username: process.env.DB_USERNAME,

  password: process.env.DB_PASSWORD,

  database: process.env.DB_DATABASE,

  entities: [
    User,
    ClientProfile,
    CoachProfile,
    Document,
    RefreshToken,
    VerificationToken,
  ],

  migrations: ['src/database/migrations/*.ts'],
});
