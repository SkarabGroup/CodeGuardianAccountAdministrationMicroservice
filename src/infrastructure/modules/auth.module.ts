// src/infrastructure/modules/auth.module.ts
import { Module } from '@nestjs/common';
import { LoginController } from '../../presentation/controllers/login.controller';
import { RegistrationController } from '../../presentation/controllers/registration.controller';
import { LoginService } from '../../application/services/login.service';
import { RegistrationService } from '../../application/services/registration.service';
import { PostgresAdapter } from '../adapters/postgre.adapter';
import { BcryptService } from '../adapters/bcrypt.service';
import { JwtService } from '../adapters/jwt.service';
import { LOGIN_SERVICE } from '../../application/services/login.service';
import { REGISTRATION_SERVICE } from '../../application/services/registration.service';

@Module({
  controllers: [RegistrationController, LoginController],
  providers: [
    // 1. Colleghiamo le porte in ingresso (Inbound Ports)
    {
      provide: LOGIN_SERVICE,
      useClass: LoginService,
    },
    {
      provide: REGISTRATION_SERVICE,
      useClass: RegistrationService,
    },

    // 2. Colleghiamo le porte in uscita (Outbound Ports)
    {
      provide: 'IUserFindPort',
      useClass: PostgresAdapter,
    },
    {
      provide: 'IUserSavePort',
      useClass: PostgresAdapter,
    },
    {
      provide: 'IHashComparePort',
      useClass: BcryptService,
    },
    {
      provide: 'IHashPasswordPort',
      useClass: BcryptService,
    },
    {
        provide: 'ITokenProviderPort',
        useClass: JwtService,
    },
    {
      provide: 'IVerifyTokenPort',
      useClass: JwtService,
    },
  ],
})
export class AuthModule {}
