import { Discord, Slash, Guard, Client, ButtonComponent } from "discordx";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, CommandInteraction } from "discord.js";
import { MusicGuards } from "../../guards/MusicGuards.js";
import { KazagumoPlayer } from "kazagumo";
import { InteractionGuards } from "../../guards/InteractionGuards.js";


@Discord()
export class Filter {
    @Slash({ name: "filter", description: "Spices up your music with filters." })
    @Guard(MusicGuards.RequireAvailablePlayer, InteractionGuards.Defer)
    public async onFilter(
        interaction: CommandInteraction,
        _: Client,
        guardData: { player: KazagumoPlayer }
    ): Promise<void> {
        await this.render(interaction, guardData);
    }

    @ButtonComponent({ id: "nightcore" })
    @Guard(MusicGuards.RequireAvailablePlayer)
    private async onNightcore(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        player.filterStatus.nightcore = !player.filterStatus.nightcore;

        if (player.filterStatus.nightcore) {
            player.shoukaku.clearFilters();
            player.shoukaku.setFilters({
                timescale: {
                    pitch: 1.2999999523162842,
                    speed: 1.2999999523162842,
                    rate: 1
                }
            });
        } else player.shoukaku.clearFilters();
        await this.render(interaction, { player });
    }

    @ButtonComponent({ id: "clear" })
    @Guard(MusicGuards.RequireAvailablePlayer)
    private async onClear(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        player.filterStatus = {
            nightcore: false,
            daycore: false
        };
        player.shoukaku.clearFilters();

        await this.render(interaction, { player });
    }

    private async render(interaction: CommandInteraction | ButtonInteraction, { player }: { player: KazagumoPlayer }): Promise<void> {
        const row: ActionRowBuilder = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("nightcore")
                    .setLabel("Nightcore")
                    .setStyle(player.filterStatus.nightcore ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("daycore")
                    .setLabel("Daycore")
                    .setStyle(player.filterStatus.nightcore ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("clear")
                    .setLabel("Clear")
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.editReply({
            embeds: [{
                color: Colors.Green,
                description: "‼️ Choose one of the buttons below to activate filter.",
                footer: {
                    text: "It will take a few seconds to activate the filter."
                }
            }],
            // @ts-ignore
            components: [row]
        });
    }
}