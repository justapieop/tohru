(await import("dotenv")).config();
import "reflect-metadata";
import { Tohru } from "./client/Tohru.js";

await new Tohru().run();