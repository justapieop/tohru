import { Client, Discord, Guard, Slash, SlashOption } from "discordx";
import { MusicGuards } from "../../guards/MusicGuards.js";
import { ApplicationCommandOptionType, Colors, CommandInteraction } from "discord.js";
import { KazagumoPlayer } from "kazagumo";
import { Utils } from "../../utils/Utils.js";

@Discord()
export class Seek {
    @Slash({ name: "seek", description: "Seeks to a specified position of the track." })
    @Guard(MusicGuards.RequireActivePlayer)
    public async onSeek(
        @SlashOption({
            name: "pos",
            description: "Position of the track to seek to.",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        pos: string,
        interaction: CommandInteraction,
        _: Client,
        { player }: { player: KazagumoPlayer }
    ): Promise<void> {

        let dur: number = Utils.stringToMs(pos);

        if (!dur || isNaN(dur)) {
            await interaction.reply({
                embeds: [
                    {
                        color: Colors.Red,
                        description: "❌ Please input a valid position in `dd:hh:mm:ss`!!"
                    }
                ]
            });
            return;
        }

        const maxPos: number = player.queue.current.length;

        if (dur < 0 || dur > maxPos) {
            await interaction.reply({
                embeds: [
                    {
                        color: Colors.Red,
                        description: "❌ The duration must be in range of the track!!"
                    }
                ]
            });
            return;
        }

        player.shoukaku.seekTo(dur);

        await interaction.reply({
            embeds: [
                {
                    color: Colors.Green,
                    description: `✅ Seeked the track to \`${pos}\`!!`
                }
            ]
        });
    }
}