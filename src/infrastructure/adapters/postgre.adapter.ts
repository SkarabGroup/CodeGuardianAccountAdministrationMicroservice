import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { IUserFindPort } from '../../application/ports/IUserFind.port';
import { IUserSavePort } from '../../application/ports/IUserSave.port';
import { User } from '../../domain/entities/user.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { IUserDeletePort } from 'src/application/ports/IUserDelete.port';

//forma dei dati che ci si aspetta dal db
interface UserDbRecord {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class PostgresAdapter implements IUserFindPort, IUserSavePort{
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        //questa post andrà mesa in base all'ip del db
        'postgres://postgres:root@localhost:5432/miodb',
    });
  }

  async save(user: User): Promise<void> {
    const query = `
            INSERT INTO users (id, email, password_hash, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5)`;

    const values = [
      user.getUserId().value,
      user.getEmail().value,
      user.getPasswordHash().value,
      user.getCreatedAt(),
      user.getUpdatedAt(),
    ];

    await this.pool.query(query, values);
  }

  async find(email: string): Promise<User | null> {
    const query = `SELECT * FROM users WHERE email = $1`;

    // 2. Diciamo alla funzione query che restituirà un risultato composto da UserDbRecord
    const { rows } = await this.pool.query<UserDbRecord>(query, [email]);

    if (rows.length === 0) {
      return null;
    }

    const dbRecord = rows[0];

    // 3. Ora TypeScript sa che dbRecord.id è sicuramente una stringa e non si arrabbia più!
    return User.reconstitute(
      UserId.create(dbRecord.id),
      Email.create(dbRecord.email),
      PasswordHash.create(dbRecord.password_hash),
      new Date(dbRecord.created_at),
      new Date(dbRecord.updated_at),
    );
  }
}

export const POSTGRES_FIND_ADAPTER = Symbol('IUserFindPort');
export const POSTGRES_SAVE_ADAPTER = Symbol('IUserSavePort');
/*export const POSTGRES_DELETE_ADAPTER = Symbol('IUserDeletePort');*/
