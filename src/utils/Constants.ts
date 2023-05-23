(await import("dotenv")).config();
import { GatewayIntentBits, IntentsBitField } from "discord.js";

export class Constants {
    public static readonly GATEWAY_INTENTS: GatewayIntentBits =
        IntentsBitField.Flags.Guilds |
        IntentsBitField.Flags.GuildMembers |
        IntentsBitField.Flags.GuildVoiceStates |
        IntentsBitField.Flags.MessageContent;

    public static readonly NODE_ENV_DEV: boolean = process.env.NODE_ENV.toLowerCase() === "dev";
}