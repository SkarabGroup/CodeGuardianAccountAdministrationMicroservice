import { Injectable } from "@nestjs/common";
import { Pool } from 'pg';
import { IUserFindPort } from "../../application/ports/IUserFind.port";
import { IUserSavePort } from "../../application/ports/IUserSave.port";
import { User } from "../../domain/entities/user.entity";
import { UserId } from "../../domain/value-objects/user-id.vo";
import { Email } from "../../domain/value-objects/email.vo";
import { PasswordHash } from "../../domain/value-objects/password-hash.vo";

@Injectable()
export class PostgresAdapter implements IUserFindPort, IUserSavePort { 
    private readonly pool: Pool;

    constructor() {
        //questa va cambiata in base alla configurazione del tuo database, servirà lURL del db in rds
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgres://postgres:root@localhost:5432/miodb'
        });
    }

    async save(user: User): Promise<void> {
        const query = `
            INSERT INTO users (id, email, password_hash, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5)
        `;
        
        const values = [
            user.getUserId().value,
            user.getEmail().value,
            user.getPasswordHash().value,
            user.getCreatedAt(),
            user.getUpdatedAt()
        ];

        await this.pool.query(query, values);
    }

    async find(email: string): Promise<User | null> {
        const query = `SELECT * FROM users WHERE email = $1`;
        const { rows } = await this.pool.query(query, [email]);

        if (rows.length === 0) {
            return null;
        }

        const dbRecord = rows[0];

        return User.reconstitute(
            UserId.create(dbRecord.id),
            Email.create(dbRecord.email),
            PasswordHash.create(dbRecord.password_hash),
            new Date(dbRecord.created_at),
            new Date(dbRecord.updated_at)
        );
    }
}