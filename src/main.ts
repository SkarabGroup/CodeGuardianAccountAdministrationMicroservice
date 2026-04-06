import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// Importa il filtro se lo hai creato prima, altrimenti lascia commentato
import { AllExceptionsFilter } from './presentation/filters/exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. VALIDAZIONE GLOBALE (Fondamentale)
  // Senza questo, i tuoi @IsEmail() e @MinLength() nei DTO vengono ignorati!
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Rimuove campi non previsti dal DTO
      forbidNonWhitelisted: true, // Lancia errore se l'utente invia campi extra
    }),
  );

  // 2. FILTRO ECCEZIONI (Opzionale ma raccomandato)
  // Trasforma i tuoi throw new InvalidCredentialsException in bellissimi 401 Unauthorized
  app.useGlobalFilters(new AllExceptionsFilter());

  // 3. CHIUSURA GRAZIOSA (Critico per il Database)
  // Questo dice a NestJS: "Quando ti spegni (o quando un test finisce), 
  // vai a cercare tutti i metodi onModuleDestroy() e avviali".
  // È questo che permette al tuo PostgresAdapter di fare `this.pool.end()`!
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();