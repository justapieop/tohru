import { Colors, CommandInteraction } from "discord.js";
import { Client, GuardFunction, Next } from "discordx";
import { KazagumoPlayer } from "kazagumo";

export class MusicGuards {
    public static async RequireActiveQueue(
        interaction: CommandInteraction,
        client: Client,
        next: Next
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

        await next();
    }
}