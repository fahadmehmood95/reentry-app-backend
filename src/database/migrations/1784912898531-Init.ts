import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1784912898531 implements MigrationInterface {
    name = 'Init1784912898531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_profiles" ADD "resume" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "client_profiles" ADD "idCard" character varying(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_profiles" DROP COLUMN "idCard"`);
        await queryRunner.query(`ALTER TABLE "client_profiles" DROP COLUMN "resume"`);
    }

}
