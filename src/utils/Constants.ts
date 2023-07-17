(await import("dotenv")).config();
import { GatewayIntentBits, IntentsBitField } from "discord.js";

export class Constants {
    public static readonly GATEWAY_INTENTS: GatewayIntentBits =
        IntentsBitField.Flags.Guilds |
        IntentsBitField.Flags.GuildMembers |
        IntentsBitField.Flags.GuildVoiceStates |
        IntentsBitField.Flags.MessageContent;

    public static readonly NODE_ENV_DEV: boolean = process.env.NODE_ENV.toLowerCase() === "dev";

    public static readonly YOUTUBE_URL_REGEX: RegExp = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/;
}