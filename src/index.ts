(await import("dotenv")).config();
import { ClusterManager, Cluster } from "discord-hybrid-sharding";
import { Constants } from "./utils/Constants.js";
import { Log } from "./utils/Log.js";

process.on("unhandledRejection", (reason: string) => Log.logger.error(`[Unhandled] ${reason}`));
process.on("uncaughtException", (reason: string) => Log.logger.error(`[Uncaught] ${reason}`));

const shardList: number[] = [
    ...String(process.env.SHARD_LIST)
        .replaceAll(" ", "")
        .replaceAll(",", "")
        .split("")
        .map((v: string) => Number(v))
];

export class HybridSharder extends ClusterManager {
    public constructor() {
        super("dist/launch.js", {
            token: process.env.DISCORD_TOKEN,
            totalShards: Number(process.env.SHARD_TOTAL),
            shardList,
            totalClusters: "auto",
            shardsPerClusters: Number(process.env.SHARD_PER_CLUSTER),
            mode: "worker"
        });

        this.on("clusterCreate", (cluster: Cluster) =>
            Log.logger.info(`Cluster ID: ${cluster.id} is ready.`)
        );

        this.on("debug", (msg: string) => {
            if (Constants.NODE_ENV_DEV) Log.logger.debug(msg);
        });
    }
}

try {
    await new HybridSharder().spawn({ timeout: -1 });
    Log.logger.info("Sharding cluster is fully initialized.");
} catch (e: any) {
    Log.logger.fatal("Failed to start sharding cluster.");
}