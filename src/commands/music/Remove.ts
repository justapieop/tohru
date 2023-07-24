import { Client, Discord, Guard, Slash, SlashOption } from "discordx";
import { MusicGuards } from "../../guards/MusicGuards.js";
import { ApplicationCommandOptionType, Colors, CommandInteraction } from "discord.js";
import { KazagumoPlayer } from "kazagumo";

@Discord()
export class Remove {
    @Slash({ name: "remove", description: "Removes songs from the queue." })
    @Guard(MusicGuards.RequireActiveQueue)
    public async onRemove(
        @SlashOption({
            name: "track",
            description: "A comma-separated list of track position in the queue to be removed.",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        track: string,
        interaction: CommandInteraction,
        _: Client,
        { player }: { player: KazagumoPlayer }
    ): Promise<void> {
        const pos: number[] = track.split(",").map((v: string) => Number(v) - 1);
        let removed: number = 0;

        for (const p of pos) {
            try {
                player.queue.remove(p);
                removed++;
            } catch (e: any) { }
        }

        await interaction.reply({
            embeds: [
                {
                    color: Colors.Green,
                    description: `✅ Removed ${removed} ${removed > 1 ? "tracks" : "track"}.`
                }
            ]
        });

    }
}