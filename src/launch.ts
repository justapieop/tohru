(await import("dotenv")).config();
import "reflect-metadata";
import { Tohru } from "./client/Tohru.js";
import { DBClient } from "./modules/db/DBClient.js";
import { Logger } from "./utils/Logger.js";

await new Tohru().run();
DBClient.getClient().then(
    () => Logger.getLogger().info("Connected to MongoDB instance.")
).catch(
    () => Logger.getLogger().info("Failed to connect to MongoDB instance.")
);