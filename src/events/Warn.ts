import { ArgsOf, Discord, On } from "discordx";
import { Constants } from "../utils/Constants.js";
import { Log } from "../utils/Log.js";
import { Events } from "discord.js";

@Discord()
export class Warn {
    @On({ event: Events.Warn })
    public onDebug([message]: ArgsOf<Events.Warn>): void {
        if (Constants.NODE_ENV_DEV) Log.logger.warn(message);
    }
}