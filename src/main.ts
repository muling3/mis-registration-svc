import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { banner as authBanner, gatewayIdentity } from '@mis/auth-middleware';
import { banner as acBanner, accessGuard } from '@mis/access-control';

const PREFIX = 'api/registration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Kong already authenticated the caller (jwt plugin). These read the
  // forwarded identity and enforce per-service authorization.
  app.use(gatewayIdentity());
  app.use(
    accessGuard({
      permission: 'profile:read',
      // Whitelisted in-service (still token-gated by Kong, except the
      // health/ready paths which are also whitelisted in kong.yml).
      allow: ['/api/registration/health', '/api/registration/ready', '/api/registration/me'],
    }),
  );

  app.setGlobalPrefix(PREFIX);
  const port = Number(process.env.PORT) || 3002;
  await app.listen(port);
  console.log(authBanner());
  console.log(acBanner());
  console.log(`mis-registration-service listening on http://localhost:${port}/${PREFIX}`);
}
bootstrap();
