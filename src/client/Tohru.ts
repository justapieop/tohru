import { Client } from "discordx";
import { Constants } from "../utils/Constants.js";
import { dirname, importx } from "@discordx/importer";
import { Options } from "discord.js";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { MusicManager } from "../modules/music/MusicManager.js";
import { DBClient } from "../modules/db/DBClient.js";
import { Log } from "../utils/Log.js";

declare module "discord.js" {
    export interface Client {
        cluster: ClusterClient<Client>,
        music: MusicManager
    }
}

export class Tohru extends Client {
    public constructor() {
        super({
            botId: process.env.DISCORD_CLIENT_ID,
            intents: Constants.GATEWAY_INTENTS,
            makeCache: Options.cacheWithLimits({
                ...Options.DefaultMakeCacheSettings,
                MessageManager: {
                    maxSize: 25
                }
            }),
            sweepers: {
                ...Options.DefaultSweeperSettings,
                messages: {
                    interval: 43200,
                    lifetime: 21600
                }
            },
            silent: !Constants.NODE_ENV_DEV,
            shards: getInfo().SHARD_LIST,
            shardCount: getInfo().TOTAL_SHARDS,
            logger: Log.dxHook
        });

        this.cluster = new ClusterClient(this);
        this.music = new MusicManager(this);
    }

    public async run(): Promise<void> {
        DBClient.getClient().then(
            () => Log.logger.info("Connected to MongoDB instance.")
        ).catch(
            () => Log.logger.fatal("Failed to connect to MongoDB instance.")
        );

        try {
            await importx(`${dirname(import.meta.url)}/../{commands,events}/**/*.{js,ts}`);
            if (!Constants.NODE_ENV_DEV)
                Log.logger.info("Loaded commands and events.");
        } catch (e: any) {
            if (!Constants.NODE_ENV_DEV)
                Log.logger.fatal("Failed to load commands and events.");
        }

        await this.login(process.env.DISCORD_TOKEN);
    }
}