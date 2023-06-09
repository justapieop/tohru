import { Client } from "discordx";
import { Constants } from "../utils/Constants.js";
import { Logger } from "../utils/Logger.js";
import { dirname, importx } from "@discordx/importer";
import { Guild, Options } from "discord.js";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import Bridge from "discord-cross-hosting";
import { MusicManager } from "../modules/music/MusicManager.js";
import { DBClient } from "../modules/db/DBClient.js";

declare module "discord.js" {
    export interface Client {
        cluster: ClusterClient<Client>,
        machine: Bridge.Shard,
        music: MusicManager
    }
}

export class Tohru extends Client {
    public constructor() {
        super({
            botId: process.env.DISCORD_CLIENT_ID,
            intents: Constants.GATEWAY_INTENTS,
            logger: Logger.getDiscordxLogger(),
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
                    lifetime: 21000
                }
            },
            silent: !Constants.NODE_ENV_DEV,
            botGuilds: [Constants.NODE_ENV_DEV ? process.env.DISCORD_DEV_GUILD_ID : (client: Client) => client.guilds.cache.map((guild: Guild) => guild.id)],
            shards: getInfo().SHARD_LIST,
            shardCount: getInfo().TOTAL_SHARDS
        });

        this.cluster = new ClusterClient(this);
        this.machine = new Bridge.Shard(this.cluster);
        this.music = new MusicManager(this);
    }

    public async run(): Promise<void> {
        DBClient.getClient().then(
            () => Logger.getLogger().info("Connected to MongoDB instance.")
        ).catch(
            () => Logger.getLogger().info("Failed to connect to MongoDB instance.")
        );

        try {
            await importx(`${dirname(import.meta.url)}/../{commands,events}/**/*.{js,ts}`);
            if (!Constants.NODE_ENV_DEV)
                Logger.getLogger().info("Loaded commands and events.");
        } catch (e: any) {
            if (!Constants.NODE_ENV_DEV)
                Logger.getLogger().error("Failed to load commands and events.");
        }

        await this.login(process.env.DISCORD_TOKEN);

        await this.music.start();
    }
}