import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCulumnAvatarInApplicantsTable1750663192400 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('Alter table applicants ADD avatar varchar(255)');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('Alter table applicants DROP COLUMN avatar');
    }

}
