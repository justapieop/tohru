import { ButtonInteraction, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Discord, Slash, Guard, ButtonComponent, Client } from "discordx";
import { KazagumoPlayer } from "kazagumo";
import { InteractionGuards } from "../../guards/InteractionGuards.js";
import { GuildSettingSchema, getGuildSetting } from "../../modules/db/schemas/GuildSettings.js";
import { MusicGuards } from "../../guards/MusicGuards.js";

@Discord()
export class Controller {
    @Slash({ name: "controller", description: "Controls the music player." })
    @Guard(MusicGuards.RequireAvailablePlayer, InteractionGuards.Defer)
    public async controller(interaction: CommandInteraction): Promise<void> {
        await this.render(interaction);
    }



    @ButtonComponent({ id: "play" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onPlay(interaction: ButtonInteraction, _: Client, guardData: { player: KazagumoPlayer }): Promise<void> {
        if (guardData.player.paused) guardData.player.pause(false);
        await this.render(interaction);
    }

    @ButtonComponent({ id: "pause" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onPause(interaction: ButtonInteraction, _: Client, guardData: { player: KazagumoPlayer }): Promise<void> {
        if (!guardData.player.paused) guardData.player.pause(true);
        await this.render(interaction);
    }

    private async render(interaction: CommandInteraction | ButtonInteraction): Promise<void> {
        const { current } = interaction.client.music.getPlayer(interaction.guildId).queue;

        const guildSetting: GuildSettingSchema = await getGuildSetting(interaction.guildId);

        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle("Now playing")
            .setDescription(`24/7 mode is ${guildSetting.alwaysOn ? "enabled" : "disabled"}`)
            .addFields(
                current ? {
                    name: current.title,
                    value: `${current.uri}\n➡ Uploader: ${current.author} | Requester: <@${current.requester}>`
                } : {
                    name: "No track is being played",
                    value: "Please add something to play"
                }
            );

        const row1: ActionRowBuilder = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("prev")
                    .setLabel("⏮️"),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("play")
                    .setLabel("▶️"),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("pause")
                    .setLabel("⏸️"),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("after")
                    .setLabel("⏭️"),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("stop")
                    .setLabel("⏹️")
            );

        await interaction.editReply({
            embeds: [embed],
            // @ts-ignore
            components: [row1]
        });
    }
}