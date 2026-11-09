import {
  createDatabaseConnection,
  type AppDatabase,
  type DatabaseConnection,
} from "@/utils/drizzle";

let activeConnection: DatabaseConnection = createDatabaseConnection();

export let db: AppDatabase = activeConnection.db;

export function getDatabaseConnection(): DatabaseConnection {
  return activeConnection;
}

export function resetDatabaseConnection(databaseUrl?: string): AppDatabase {
  activeConnection = createDatabaseConnection(databaseUrl);
  db = activeConnection.db;
  return db;
}
