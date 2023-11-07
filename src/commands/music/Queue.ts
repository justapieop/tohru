import { PaginationResolver, Pagination, PaginationType } from "@discordx/pagination";
import { Client, Discord, Guard, Slash, SlashOption } from "discordx";
import { MusicGuards } from "../../guards/MusicGuards.js";
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import { Utils } from "../../utils/Utils.js";

@Discord()
export class Queue {
    @Slash({ name: "queue", description: "Shows the queue." })
    @Guard(MusicGuards.RequireActiveQueue)
    public async queue(
        interaction: CommandInteraction,
        @SlashOption({
            name: "prev",
            description: "Whether to display the previous queue.",
            type: ApplicationCommandOptionType.Boolean,
            required: false
        }) previous: boolean = false,
        _: Client,
        { player }: { player: KazagumoPlayer }
    ): Promise<void> {
        const { queue, prev } = player;
        const chunked: KazagumoTrack[][] = previous ? Utils.chunk(prev, 5) : Utils.chunk(queue, 5);

        const resolver: PaginationResolver = new PaginationResolver(
            (page: number) => {
                const embed: EmbedBuilder = new EmbedBuilder()
                    .setTitle(previous ? "Prevous queue" : "Queue")
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