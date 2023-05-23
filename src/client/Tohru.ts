import { Client } from "discordx";
import { Constants } from "../utils/Constants.js";
import { Logger } from "../utils/Logger.js";
import { dirname, importx } from "@discordx/importer";
import { Guild, Options } from "discord.js";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";

declare module "discordx" {
    export interface Client {
        cluster: ClusterClient<Client>
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
    }

    public async run(): Promise<void> {
        try {
            await importx(`${dirname(import.meta.url)}/../{commands,events}/**/*.{js,ts}`);
            if (!Constants.NODE_ENV_DEV)
                Logger.getLogger().info("Loaded commands and events.");
        } catch (e: any) {
            if (!Constants.NODE_ENV_DEV)
                Logger.getLogger().error("Failed to load commands and events.");
        }

        await this.login(process.env.DISCORD_TOKEN);
    }
}