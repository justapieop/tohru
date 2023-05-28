import "reflect-metadata";
import { Koa } from "@discordx/koa";
import json from "koa-json";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { importx, dirname } from "@discordx/importer";
import { Constants } from "../utils/Constants.js";
import { DBClient } from "../modules/db/DBClient.js";
import { Logger } from "../utils/Logger.js";
import { BridgeServer } from "../bridge.js";

declare module "@discordx/koa" {
    export interface Koa {
        bridge: BridgeServer
    }
}
export class API extends Koa {
    public constructor(bridge: BridgeServer) {
        super({
            globalMiddlewares: [
                Logger.getKoaLogger,
                json({ pretty: true }),
                bodyParser(),
                cors({
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    credentials: true
                })
            ]
        });
        this.bridge = bridge;
    }

    public async start(): Promise<void> {
        DBClient.getClient().then(
            () => Logger.getLogger().info("Connected to MongoDB instance.")
        ).catch(
            () => Logger.getLogger().info("Failed to connect to MongoDB instance.")
        );

        try {
            await importx(`${dirname(import.meta.url)}/routes/**/*.{js,ts}`);
            if (!Constants.NODE_ENV_DEV)
                Logger.getLogger().info("Loaded routes.");
        } catch (e: any) {
            if (!Constants.NODE_ENV_DEV)
                Logger.getLogger().error("Failed to load routes.");
        }

        await this.build();

        try {
            if (process.env.SSL_ENABLE.toLowerCase() === "true") {
                createHttpsServer({
                    key: process.env.SSL_KEY_PATH,
                    cert: process.env.SSL_CERT_PATH,
                    minVersion: "TLSv1.2",
                    maxVersion: "TLSv1.3",
                    ciphers: Constants.CIPHER_SUITE
                }, this.callback()).listen(Number(process.env.PORT));
            } else {
                createHttpServer(this.callback()).listen(Number(process.env.PORT));
            }
            Logger.getLogger().info(`API server is running on port ${process.env.PORT}.`);
        } catch (e: any) {
            Logger.getLogger().error("Failed to start API server.");
        }
    }
}