import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1784828442219 implements MigrationInterface {
    name = 'Init1784828442219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshTokenHash" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "passwordResetCodeHash" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "passwordResetExpiresAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetCodeHash"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshTokenHash"`);
    }

}
