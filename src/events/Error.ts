import { ArgsOf, Discord, On } from "discordx";
import { Constants } from "../utils/Constants.js";
import { Log } from "../utils/Log.js";
import { Events } from "discord.js";

@Discord()
export class Error {
    @On({ event: Events.Error })
    public onDebug([message]: ArgsOf<Events.Error>): void {
        if (Constants.NODE_ENV_DEV) Log.logger.error(message);
    }
}