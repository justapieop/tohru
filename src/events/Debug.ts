import { ArgsOf, Discord, On } from "discordx";
import { Constants } from "../utils/Constants.js";
import { Log } from "../utils/Log.js";
import { Events } from "discord.js";

@Discord()
export class Debug {
    @On({ event: Events.Debug })
    public onDebug([message]: ArgsOf<Events.Debug>): void {
        if (Constants.NODE_ENV_DEV) Log.logger.debug(message);
    }
}