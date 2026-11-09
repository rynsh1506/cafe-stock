import { app, APP_VERSION } from "@/app";
import { logger } from "@/utils/logger";

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOST || "0.0.0.0";

app.listen({ port, hostname }, () => {
  logger.info("CafeStock server started", {
    version: APP_VERSION,
    hostname,
    port,
  });
});
