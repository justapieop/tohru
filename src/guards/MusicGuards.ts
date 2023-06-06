import { ButtonInteraction, Colors, CommandInteraction } from "discord.js";
import { Client, GuardFunction, Next } from "discordx";
import { KazagumoPlayer } from "kazagumo";

export class MusicGuards {
    public static async RequireActiveQueue(
        interaction: CommandInteraction,
        client: Client,
        next: Next,
        guardData: any
    ): Promise<GuardFunction<CommandInteraction>> {
        const player: KazagumoPlayer = client.music.getPlayer(interaction.guildId);

        if (!player || player.queue.isEmpty) {
            await interaction.reply({
                embeds: [
                    {
                        color: Colors.Red,
                        description: "❌ Please put something in the queue first!"
                    }
                ]
            });
            return;
        }

        guardData.player = player;

        await next();
    }

    public static async RequireActivePlayer(
        interaction: CommandInteraction | ButtonInteraction,
        client: Client,
        next: Next,
        guardData: any
    ): Promise<GuardFunction<CommandInteraction | ButtonInteraction>> {
        const player: KazagumoPlayer = client.music.getPlayer(interaction.guildId);

        if (!player || !player.queue.current) {
            if (interaction instanceof CommandInteraction) await interaction.reply({
                embeds: [
                    {
                        color: Colors.Red,
                        description: "❌ Please play something first!"
                    }
                ]
            });
            return;
        }

        guardData.player = player;

        await next();
    }

    public static async RequireAvailablePlayer(
        interaction: CommandInteraction | ButtonInteraction,
        client: Client,
        next: Next
    ): Promise<GuardFunction<CommandInteraction | ButtonInteraction>> {
        const player: KazagumoPlayer = client.music.getPlayer(interaction.guildId);

        if (!player) {
            if (interaction instanceof CommandInteraction) await interaction.reply({
                embeds: [
                    {
                        color: Colors.Red,
                        description: "❌ Please play something first!"
                    }
                ]
            });
            return;
        }

        await next();
    }
}