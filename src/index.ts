(await import("dotenv")).config();
import { ClusterManager, Cluster } from "discord-hybrid-sharding";
import { join } from "path";
import { Logger } from "./utils/Logger.js";

export class HybridSharder extends ClusterManager {
    public constructor() {
        super(join("dist", "launch.js"), {
            token: process.env.DISCORD_TOKEN,
            totalShards: "auto",
            totalClusters: "auto",
            shardsPerClusters: 5
        });

        this.on("clusterReady", (cluster: Cluster) =>
            Logger.getLogger().info(`Cluster ID: ${cluster.id} is ready.`)
        );
    }
}

await new HybridSharder().spawn({ timeout: -1 });