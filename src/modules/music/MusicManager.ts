import { Client, Guild } from "discord.js";
import { Connectors, TrackEndEvent } from "shoukaku";
import { Kazagumo, KazagumoPlayer, KazagumoTrack, Plugins } from "kazagumo";
import { Constants } from "../../utils/Constants.js";
import { Logger } from "../../utils/Logger.js";
import { LavalinkNodeSchema, LavalinkNode } from "../db/schemas/LavalinkNode.js";
import { DefaultSettings } from "../../utils/DefaultSettings.js";

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
            if (Constants.NODE_ENV_DEV) Logger.getLogger().debug(info);
        });

        this.shoukaku.once("ready", () =>
            Logger.getLogger().info("Shoukaku is ready.")
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
        const nodes: LavalinkNodeSchema[] = Array.from(await LavalinkNode.find());

        for (const n of nodes) {
            this._client.music.shoukaku.addNode(n);
        }
    }
}