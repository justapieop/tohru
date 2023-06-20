import { Bridge } from "discord-cross-hosting";
import { TLSSocket } from "tls";
import { Logger } from "./utils/Logger.js";
import { Constants } from "./utils/Constants.js";

export class BridgeServer extends Bridge {
    public constructor() {
        super({
            token: process.env.DISCORD_TOKEN,
            port: Number(process.env.PORT),
            authToken: process.env.BRIDGE_AUTH_TOKEN,
            totalShards: "auto",
            shardsPerCluster: Number(process.env.SHARD_PER_CLUSTER),
            totalMachines: Number(process.env.BRIDGE_TOTAL_MACHINES),
            tls: true,
            options: {
                ciphers: "PSK",
                pskCallback: (_: TLSSocket, identity: string) => {
                    const key: Buffer = Buffer.from(process.env.BRIDGE_PSK);
                    if (identity === process.env.BRIDGE_IDENTITY) return key;
                }
            }
        });

        this.on("debug", (msg: string) => {
            if (Constants.NODE_ENV_DEV) Logger.getLogger().debug(msg)
        });

        this.on("ready", () => Logger.getLogger().info("Bridge server is ready."));
    }
}

export const bridge: BridgeServer = new BridgeServer();
await bridge.start();