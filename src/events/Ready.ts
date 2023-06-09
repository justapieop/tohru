import prettyMs from "pretty-ms";
import { Client, Discord, On } from "discordx";
import { Logger } from "../utils/Logger.js";
import { Constants } from "../utils/Constants.js";
import { ActivityType } from "discord.js";

@Discord()
export class Ready {
    @On({ event: "ready" })
    public async onReady([], client: Client): Promise<void> {
        await client.clearApplicationCommands();
        if (Constants.NODE_ENV_DEV) await client.initApplicationCommands({
            global: {
                disable: {
                    add: true,
                    delete: true,
                    update: true
                }
            }
        });
        else await client.initApplicationCommands();

        setInterval(async () => {
            const timeOnline: number = Date.now() - client.readyTimestamp;
            client.user.setActivity(`Online for ${prettyMs(timeOnline)}`, { type: ActivityType.Streaming });
        }, 5000);

        Logger.getLogger().info(`Logged in as ${client.user.tag}`);
    }
}