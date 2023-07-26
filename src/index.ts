(await import("dotenv")).config();
import { ClusterManager, Cluster } from "discord-hybrid-sharding";
import Bridge from "discord-cross-hosting";
import { Logger } from "./utils/Logger.js";
import { Constants } from "./utils/Constants.js";

process.on("unhandledRejection", (reason: string) => Logger.getLogger().error(`[UNHANDLED] ${reason}`));
process.on("uncaughtException", (reason: string) => Logger.getLogger().error(`[UNCAUGHT] ${reason}`));

export class BridgeClient extends Bridge.Client {
    public constructor() {
        super({
            agent: "bot",
            host: process.env.BRIDGE_HOST,
            port: Number(process.env.PORT),
            authToken: process.env.BRIDGE_AUTH_TOKEN,
            rollingRestarts: true,
            tls: true,
            retries: 120,
            options: {
                ciphers: "PSK",
                checkServerIdentity: () => void 0,
                pskCallback: () => {
                    return { psk: Buffer.from(process.env.BRIDGE_PSK), identity: process.env.BRIDGE_IDENTITY };
                }
            }
        });

        this.on("ready", () => Logger.getLogger().info("Bridge connection is ready."));
        this.on("debug", (msg: string) => {
            if (Constants.NODE_ENV_DEV) Logger.getLogger().debug(msg)
        });
    }
}

const bridgeClient: BridgeClient = new BridgeClient();
await bridgeClient.connect();

export class HybridSharder extends ClusterManager {
    public constructor() {
        super("dist/launch.js", {
            token: process.env.DISCORD_TOKEN,
            totalShards: "auto",
            totalClusters: "auto",
            shardsPerClusters: Number(process.env.SHARD_PER_CLUSTER)
        });

        this.on("clusterReady", (cluster: Cluster) =>
            Logger.getLogger().info(`Cluster ID: ${cluster.id} is ready.`)
        );
        this.on("debug", (msg: string) => {
            if (Constants.NODE_ENV_DEV) Logger.getLogger().debug(msg)
        });
    }
}

const manager: HybridSharder = new HybridSharder();

bridgeClient.listen(manager);
const shardData = await bridgeClient.requestShardData();

if (shardData && shardData.shardList) {
    manager.totalShards = shardData.totalShards;
    manager.totalClusters = shardData.shardList.length;
    manager.shardList = shardData.shardList as any;
    manager.clusterList = shardData.clusterList;
    await manager.spawn({ timeout: -1 });
} else {
    Logger.getLogger().error("No shard data found. Exiting...");
    process.exit(1);
}