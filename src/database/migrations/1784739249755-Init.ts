import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1784739249755 implements MigrationInterface {
    name = 'Init1784739249755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "coach_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "specialization" character varying(200) NOT NULL, "userId" uuid, CONSTRAINT "REL_e6994e1be0dd7a878d437bbbcc" UNIQUE ("userId"), CONSTRAINT "PK_0f4001455b40350665f589642dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "client_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "releaseDate" date NOT NULL, "userId" uuid, CONSTRAINT "REL_af81cdb71317b2f0f6cb6bce77" UNIQUE ("userId"), CONSTRAINT "PK_fc4acd4b04f4a0537e7213f8ddd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."documents_type_enum" AS ENUM('RESUME', 'ID_CARD', 'CERTIFICATE', 'LICENSE', 'PASSPORT', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."documents_type_enum" NOT NULL, "fileUrl" character varying NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'COACH', 'CLIENT')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'PENDING')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying NOT NULL, "phoneNumber" character varying(20) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'CLIENT', "status" "public"."users_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "coach_profiles" ADD CONSTRAINT "FK_e6994e1be0dd7a878d437bbbcc0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_profiles" ADD CONSTRAINT "FK_af81cdb71317b2f0f6cb6bce776" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_e300b5c2e3fefa9d6f8a3f25975" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_e300b5c2e3fefa9d6f8a3f25975"`);
        await queryRunner.query(`ALTER TABLE "client_profiles" DROP CONSTRAINT "FK_af81cdb71317b2f0f6cb6bce776"`);
        await queryRunner.query(`ALTER TABLE "coach_profiles" DROP CONSTRAINT "FK_e6994e1be0dd7a878d437bbbcc0"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TYPE "public"."documents_type_enum"`);
        await queryRunner.query(`DROP TABLE "client_profiles"`);
        await queryRunner.query(`DROP TABLE "coach_profiles"`);
    }

}
