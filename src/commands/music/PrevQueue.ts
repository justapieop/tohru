import { PaginationResolver, Pagination, PaginationType } from "@discordx/pagination";
import { Client, Discord, Guard, Slash } from "discordx";
import { MusicGuards } from "../../guards/MusicGuards.js";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import { Utils } from "../../utils/Utils.js";

@Discord()
export class PrevQueue {
    @Slash({ name: "prevqueue", description: "Shows the previous queue." })
    @Guard(MusicGuards.RequirePrevQueue)
    public async queue(interaction: CommandInteraction, _: Client, guardData: { player: KazagumoPlayer }): Promise<void> {
        const { prev } = guardData.player;
        const chunked: KazagumoTrack[][] = Utils.chunk(prev, 5);

        const resolver: PaginationResolver = new PaginationResolver(
            (page: number) => {
                const embed: EmbedBuilder = new EmbedBuilder()
                    .setTitle("Previous queue")
                    .setFooter({
                        text: `Page ${page + 1}/${chunked.length}`
                    });

                const selected: KazagumoTrack[] = chunked[page];

                for (const track of selected)
                    embed.addFields({
                        name: track.title,
                        value: `➡️ ${track.uri}\nRequested by: <@${track.requester}>`,
                        inline: false
                    });

                return {
                    embeds: [embed]
                };
            }, chunked.length);

        const pagination: Pagination = new Pagination(interaction, resolver, {
            onTimeout: async () => await interaction.deleteReply(),
            time: 30 * 60 * 1000,
            type: PaginationType.Button
        });

        await pagination.send();
    }
}