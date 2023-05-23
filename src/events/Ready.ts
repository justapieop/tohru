import { Client, Discord, On } from "discordx";
import { Logger } from "../utils/Logger.js";

@Discord()
export class Ready {
    @On({ event: "ready" })
    public async onReady([], client: Client): Promise<void> {
        Logger.getLogger().info(`Logged in as ${client.user.tag}`);
    }
}