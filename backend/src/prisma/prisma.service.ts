import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma'; // ✅ match output path

@Injectable() // This allows NestJS to inject this service wherever needed.
export class PrismaService extends PrismaClient implements OnModuleInit {

  async onModuleInit() {
    // This connects Prisma to the database when the application starts.
    await this.$connect();
  }

async enableShutdownHooks(app: INestApplication) {
  (this as any).$on('beforeExit', async () => {
    await app.close();
  });
}

}
