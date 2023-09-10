import { Client, Guild } from "discord.js";
import { Connectors, TrackEndEvent } from "shoukaku";
import { Kazagumo, KazagumoPlayer, Plugins } from "kazagumo";
import { Constants } from "../../utils/Constants.js";
import { DefaultSettings } from "../../utils/DefaultSettings.js";
import { Log } from "../../utils/Log.js";
import { client } from "../db/DBClient.js";

export class MusicManager extends Kazagumo {
    private _client: Client;

    public constructor(client: Client) {
        super({
            defaultSearchEngine: "soundcloud",
            send: async (guildId: string, payload: any) => {
                const guild: Guild = await client.guilds.fetch(guildId);
                if (guild) guild.shard.send(payload, true);
            },
            plugins: [
                new Plugins.PlayerMoved(client)
            ]
        }, new Connectors.DiscordJS(client), []);

        this.shoukaku.on("debug", (_: string, info: string) => {
            if (Constants.NODE_ENV_DEV) Log.logger.debug(info);
        });

        this.shoukaku.once("ready", () =>
            Log.logger.info("Shoukaku is ready.")
        );

        this.on("playerCreate", (player: KazagumoPlayer) => {
            player.skippedToPrev = false;
            player.prev = [];
            player.filterStatus = DefaultSettings.DEFAULT_FILTER_STATUS;
            player.shoukaku.on("end", (event: TrackEndEvent) => {
                if (event.reason === "FINISHED")
                    player.prev.push(player.queue.previous);
            });
        });

        this._client = client;
    }

    public async start(): Promise<void> {
        const nodes = Array.from((await client.lavalinknodes.findMany()));

        for (const n of nodes) {
            this._client.music.shoukaku.addNode(n);
        }
    }
}