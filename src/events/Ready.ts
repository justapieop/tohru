import { Client, Discord, On } from "discordx";
import { Logger } from "../utils/Logger.js";
import { ActivityType } from "discord.js";
import { Constants } from "../utils/Constants.js";

@Discord()
export class Ready {
    @On({ event: "ready" })
    public async onReady([], client: Client): Promise<void> {
        await client.guilds.fetch();
        await client.clearApplicationCommands();

        !Constants.NODE_ENV_DEV ?
            await client.initGlobalApplicationCommands() :
            await client.initGuildApplicationCommands(
                process.env.DISCORD_DEV_GUILD_ID,
                Array.from(client.applicationCommands)
            );

        client.user.setActivity(`Music With /play`, { type: ActivityType.Streaming });

        Logger.getLogger().info(`Logged in as ${client.user.tag}`);
        await client.music.start();
    }
}