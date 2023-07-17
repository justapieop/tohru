import { ButtonInteraction, Colors, CommandInteraction } from "discord.js";
import { Client, GuardFunction, Next } from "discordx";
import { KazagumoPlayer } from "kazagumo";

export class MusicGuards {
    public static async RequireActiveQueue(
        interaction: CommandInteraction | ButtonInteraction,
        client: Client,
        next: Next,
        guardData: any
    ): Promise<GuardFunction<CommandInteraction | ButtonInteraction>> {
        const player: KazagumoPlayer = client.music.getPlayer(interaction.guildId);

        if (!player || player.queue.isEmpty) {
            if (interaction instanceof CommandInteraction) {
                await interaction.reply({
                    embeds: [
                        {
                            color: Colors.Red,
                            description: "❌ Please put something in the queue first!"
                        }
                    ]
                });
            }
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

        console.log("checking condition...")

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

        console.log("condition passed...")

        guardData.player = player;

        await next();
    }

    public static async RequireAvailablePlayer(
        interaction: CommandInteraction | ButtonInteraction,
        client: Client,
        next: Next,
        guardData: any
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

        guardData.player = player;

        await next();
    }

    public static async RequirePrevQueue(
        interaction: CommandInteraction | ButtonInteraction,
        client: Client,
        next: Next,
        guardData: any
    ): Promise<GuardFunction<CommandInteraction | ButtonInteraction>> {
        const player: KazagumoPlayer = client.music.getPlayer(interaction.guildId);
        if (!player || !player.prev || !player.prev.length) {
            if (interaction instanceof CommandInteraction) await interaction.reply({
                embeds: [
                    {
                        color: Colors.Red,
                        description: "❌ Please put something in the previous queue first!"
                    }
                ]
            });
            return;
        }

        guardData.player = player;

        await next();
    }
}