import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { IUserFindPort } from '../../application/ports/IUserFind.port';
import { IUserSavePort } from '../../application/ports/IUserSave.port';
import { ISessionSavePort } from '../../application/ports/ISessionSave.port';
import { ISessionDeletePort } from '../../application/ports/ISessionDelete.port';
import { User } from '../../domain/entities/user.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { IUserDeletePort } from '../../application/ports/IUserDelete.port';
import { IUserUpdatePort } from '../../application/ports/IUserUpdate.port';

export const POSTGRES_CONNECTION_STRING_TOKEN = Symbol('POSTGRES_CONNECTION_STRING');

// forma dei dati che ci si aspetta dal db
interface UserDbRecord {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class PostgresAdapter
  implements
    OnModuleInit,
    IUserFindPort,
    IUserSavePort,
    ISessionSavePort,
    ISessionDeletePort,
    IUserDeletePort,
    IUserUpdatePort
{
  private readonly pool: Pool;
  private readonly logger = new Logger(PostgresAdapter.name);

  constructor(@Inject(POSTGRES_CONNECTION_STRING_TOKEN) connectionString: string) {
    this.pool = new Pool({
      connectionString: connectionString
    });
  }
  
  // ESEGUITO IN AUTOMATICO DA NESTJS ALL'AVVIO
  async onModuleInit() {
    this.logger.log('Verifica e setup delle tabelle del database in corso...');
    
    try {
      const createTablesQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            refresh_token VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`;
      
      // Eseguiamo entrambe le query in un colpo solo
      await this.pool.query(createTablesQuery);
      
      this.logger.log('Tabelle verificate e pronte all\'uso!');
    } catch (error) {
      this.logger.error('Errore critico durante la creazione delle tabelle:', error);
      throw error; // Blocca l'avvio se il db è irraggiungibile
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
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

    const { rows } = await this.pool.query<UserDbRecord>(query, [email]);
    console.log('qua?');
    console.log('rows:', rows);
    if (rows.length === 0) {
      return null;
    }
    const dbRecord = rows[0];
    
    return User.reconstitute(
      UserId.create(dbRecord.id),
      Email.create(dbRecord.email),
      PasswordHash.create(dbRecord.password_hash),
      new Date(dbRecord.created_at),
      new Date(dbRecord.updated_at),
    );
  }

  async saveSession(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<void> {
    const query = `
            INSERT INTO sessions (id, user_id, refresh_token, expires_at, created_at) 
            VALUES ($1, $2, $3, $4, $5)`;

    const values = [randomUUID(), userId, refreshToken, expiresAt, new Date()];
    await this.pool.query(query, values);
  }

  async deleteSession(refreshToken: string): Promise<void> {
    const query = `DELETE FROM sessions WHERE refresh_token = $1`;
    await this.pool.query(query, [refreshToken]);
  }

  async deleteUser(userId: string): Promise<void> {
    const query = `DELETE FROM users WHERE id = $1`;
    await this.pool.query(query, [userId]);
  }

  async update(user: User): Promise<void> {
    const query = `
            UPDATE users 
            SET email = $1, password_hash = $2, updated_at = $3 
            WHERE id = $4`;

    const values = [
      user.getEmail().value,
      user.getPasswordHash().value,
      user.getUpdatedAt(),
      user.getUserId().value,
    ];

    await this.pool.query(query, values);
  }
}

export const POSTGRES_FIND_ADAPTER = Symbol('IUserFindPort');
export const POSTGRES_SAVE_ADAPTER = Symbol('IUserSavePort');
export const POSTGRES_DELETE_ADAPTER = Symbol('IUserDeletePort');
export const POSTGRES_UPDATE_ADAPTER = Symbol('IUserUpdatePort');
export const POSTGRES_SESSION_SAVE_ADAPTER = Symbol('ISessionSavePort');
export const POSTGRES_SESSION_DELETE_ADAPTER = Symbol('ISessionDeletePort');