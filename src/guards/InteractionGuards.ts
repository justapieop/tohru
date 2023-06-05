import { CommandInteraction } from "discord.js";
import { Client, GuardFunction, Next } from "discordx";

export class InteractionGuards {
    public static async Defer(
        interaction: CommandInteraction,
        _: Client,
        next: Next
    ): Promise<GuardFunction<CommandInteraction>> {
        try {
            await interaction.deferReply();
            await next();
        } catch (e: any) {
            return;
        }
    }
}