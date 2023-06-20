import { ApplicationCommandOptionType, Colors, CommandInteraction } from "discord.js";
import { Discord, Slash, Guard, SlashOption, Client } from "discordx";
import { MusicGuards } from "../../guards/MusicGuards.js";
import { KazagumoPlayer } from "kazagumo";

@Discord()
export class Volume {
    @Slash({ name: "volume", description: "Sets the volume of the player." })
    @Guard(MusicGuards.RequireActivePlayer)
    public async onVolume(
        @SlashOption({
            name: "volume",
            description: "Volume from 0 - 200.",
            type: ApplicationCommandOptionType.Number,
            required: true,
            minValue: 0,
            maxValue: 200
        })
        volume: number,
        interaction: CommandInteraction,
        _: Client,
        { player }: { player: KazagumoPlayer }
    ): Promise<void> {
        player.setVolume(volume);
        await interaction.reply({
            embeds: [
                {
                    color: Colors.Red,
                    description: `✅ Successfully set the volume to \`${volume}%\`.`
                }
            ]
        });
    }
}