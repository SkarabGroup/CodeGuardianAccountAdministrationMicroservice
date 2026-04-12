// src/infrastructure/modules/auth.module.ts
import { Module } from '@nestjs/common';
import { LoginController } from '../../presentation/controllers/login.controller';
import { RegistrationController } from '../../presentation/controllers/registration.controller';
import { LoginService } from '../../application/services/login.service';
import { RegistrationService } from '../../application/services/registration.service';
import { POSTGRES_CONNECTION_STRING_TOKEN, PostgresAdapter } from '../adapters/postgre.adapter';
import { BcryptService, BCRYPT_ROUNDS_TOKEN } from '../adapters/bcrypt.service';
import { JwtService, JWT_EXPIRES_IN_TOKEN, JWT_SECRET_TOKEN } from '../adapters/jwt.service';
import { LOGIN_SERVICE } from '../../application/services/login.service';
import { REGISTRATION_SERVICE } from '../../application/services/registration.service';
import { LogoutController } from '../../presentation/controllers/logout.controller';
import {
  LogoutService,
  LOGOUT_SERVICE,
} from '../../application/services/logout.service';
import {
  UPDATE_SERVICE,
  UpdateService,
} from '../../application/services/update.service';
import {
  DELETE_SERVICE,
  DeleteService,
} from '../../application/services/delete.service';
import { UpdateController } from '../../presentation/controllers/update.controller';
import { DeleteUserController } from '../../presentation/controllers/delete.controller';
import { loadConfig } from '../configuration/env.config.service';
const config = loadConfig();
@Module({
  controllers: [
    RegistrationController,
    LoginController,
    LogoutController,
    UpdateController,
    DeleteUserController,
  ],
  providers: [
    PostgresAdapter,
    BcryptService,
    JwtService,
    // 1. Colleghiamo le porte in ingresso (Inbound Ports)
    {
      provide: LOGIN_SERVICE,
      useClass: LoginService,
    },
    {
      provide: REGISTRATION_SERVICE,
      useClass: RegistrationService,
    },
    {
      provide: LOGOUT_SERVICE,
      useClass: LogoutService,
    },
    {
      provide: UPDATE_SERVICE,
      useClass: UpdateService,
    },
    {
      provide: DELETE_SERVICE,
      useClass: DeleteService,
    },
    // 2. Colleghiamo le porte in uscita (Outbound Ports)
    {
      provide: 'IUserFindPort',
      useExisting: PostgresAdapter,
    },
    {
      provide: 'IUserSavePort',
      useExisting: PostgresAdapter,
    },
    {
      provide: 'ISessionSavePort',
      useExisting: PostgresAdapter,
    },
    {
      provide: 'ISessionDeletePort',
      useExisting: PostgresAdapter,
    },
    {
      provide: 'IHashComparePort',
      useExisting: BcryptService,
    },
    {
      provide: 'IHashPasswordPort',
      useExisting: BcryptService,
    },
    {
      provide: 'ITokenProviderPort',
      useExisting: JwtService,
    },
    {
      provide: 'IVerifyTokenPort',
      useExisting: JwtService,
    },
    {
      provide: 'IUserDeletePort',
      useExisting: PostgresAdapter,
    },
    {
      provide: 'IUserUpdatePort',
      useExisting: PostgresAdapter,
    },
    //configurazione
    {
      provide: POSTGRES_CONNECTION_STRING_TOKEN,
      useValue: config.db.url,
    },
    {
      provide: BCRYPT_ROUNDS_TOKEN,
      useValue: config.security.bcryptRounds,
    },
    { 
      provide: JWT_SECRET_TOKEN,
      useValue: config.security.jwtSecret,
    },
    {
      provide: JWT_EXPIRES_IN_TOKEN,
      useValue: config.security.jwtExpiresIn,
    },
  ],
})
export class AuthModule {}
