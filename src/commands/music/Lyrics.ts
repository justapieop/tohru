import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Guard, Slash, SlashOption } from "discordx";
import { InteractionGuards } from "../../guards/InteractionGuards.js";
import { Utils } from "../../utils/Utils.js";
import { Client, Song } from "genius-lyrics";

@Discord()
export class Lyrics {
    @Slash({ name: "lyrics", description: "Finds the lyrics of a specified song." })
    @Guard(InteractionGuards.Defer)
    public async lyrics(
        @SlashOption({
            name: "keyword",
            description: "Keyword of the track.",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        keyword: string,
        interaction: CommandInteraction
    ): Promise<void> {
        const client: Client = new Client(process.env.GENIUS_ACCESS_TOKEN);

        const search: Song[] = await client.songs.search(keyword);

        if (!search.length) {
            await interaction.editReply({
                embeds: [
                    {
                        color: Colors.Red,
                        description: "❌ Please join a voice channel first!!"
                    }
                ]
            });
            return;
        }

        const song: Song = search[0];

        const lyrics: string = await song.lyrics(true);
        const split: string[] = lyrics.split("\n");
        const chunk: string[][] = Utils.splitIntoNChunks(split, Math.ceil(lyrics.length / 4096));

        const arrOfEmbeds: EmbedBuilder[] = [
            new EmbedBuilder()
                .setTitle(`${song.artist.name} - ${song.title}`)
                .setDescription(chunk[0].join("\n"))
        ];

        for (let i: number = 1; i < chunk.length; i++) {
            arrOfEmbeds.push(
                new EmbedBuilder()
                    .setDescription(chunk[i].join("\n"))
            );
        }

        await interaction.editReply({
            embeds: arrOfEmbeds
        });
    }
}