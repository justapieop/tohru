import { ArgsOf, Discord, On } from "discordx";
import { Constants } from "../utils/Constants.js";
import { Logger } from "../utils/Logger.js";

@Discord()
export class Debug {
    @On({ event: "debug" })
    public onDebug([message]: ArgsOf<"debug">): void {
        if (Constants.NODE_ENV_DEV) Logger.getLogger().debug(message);
    }
}