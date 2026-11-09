import { app, APP_VERSION } from "@/app";
import { runMigrations } from "@/db/migrate";
import { seedDatabase } from "@/db/seed";
import { logger } from "@/utils/logger";

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOST || "0.0.0.0";

async function bootstrap(): Promise<void> {
  if (process.env.AUTO_MIGRATE !== "false") {
    await runMigrations();
    await seedDatabase();
  }

  app.listen({ port, hostname }, () => {
    logger.info("CafeStock server started", {
      version: APP_VERSION,
      hostname,
      port,
    });
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to bootstrap CafeStock server", {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
