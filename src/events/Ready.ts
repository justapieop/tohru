import { Client, Discord, On } from "discordx";
import { ActivityType, Events } from "discord.js";
import { Constants } from "../utils/Constants.js";
import { Log } from "../utils/Log.js";

@Discord()
export class Ready {
    @On({ event: Events.ClientReady })
    public async onReady([], client: Client): Promise<void> {
        await client.guilds.fetch();
        await client.clearApplicationCommands();

        !Constants.NODE_ENV_DEV ?
            await client.initGlobalApplicationCommands() :
            await client.initGuildApplicationCommands(
                process.env.DISCORD_DEV_GUILD_ID,
                Array.from(client.applicationCommands)
            );

        client.user.setActivity(`Music with /play`, { type: ActivityType.Streaming });

        Log.logger.info(`Logged in as ${client.user.username}`);
        await client.music.start();
    }
}