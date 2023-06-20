import { ButtonInteraction, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Discord, Slash, Guard, ButtonComponent, Client } from "discordx";
import { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import { InteractionGuards } from "../../guards/InteractionGuards.js";
import { GuildSetting, GuildSettingSchema, getGuildSetting } from "../../modules/db/schemas/GuildSettings.js";
import { MusicGuards } from "../../guards/MusicGuards.js";

@Discord()
export class Controller {
    @Slash({ name: "controller", description: "Controls the music player." })
    @Guard(MusicGuards.RequireAvailablePlayer, InteractionGuards.Defer)
    public async controller(interaction: CommandInteraction): Promise<void> {
        await this.render(interaction);
    }

    @ButtonComponent({ id: "prev" })
    @Guard(MusicGuards.RequirePrevQueue)
    private async onPrev(interaction: ButtonInteraction, _: Client, guardData: { player: KazagumoPlayer }): Promise<void> {
        guardData.player.queue.unshift(guardData.player.queue.current);
        guardData.player.skippedToPrev = true;
        guardData.player.play(guardData.player.prev.pop(), { replaceCurrent: true });
        guardData.player.skippedToPrev = false;
        await this.render(interaction);
    }

    @ButtonComponent({ id: "after" })
    @Guard(MusicGuards.RequireActiveQueue)
    private async onAfter(interaction: ButtonInteraction, _: Client, guardData: { player: KazagumoPlayer }): Promise<void> {

        guardData.player.play(guardData.player.queue.shift(), { replaceCurrent: true });
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

    @ButtonComponent({ id: "stop" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onStop(interaction: ButtonInteraction, _: Client, guardData: { player: KazagumoPlayer }): Promise<void> {
        guardData.player.destroy();
        await interaction.deleteReply();
    }

    @ButtonComponent({ id: "trackLoop" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onTrackLoop(interaction: ButtonInteraction, _: Client, guardData: { player: KazagumoPlayer }): Promise<void> {
        if (guardData.player.loop !== "track") guardData.player.setLoop("track");
        else guardData.player.setLoop("none");
        await this.render(interaction);
    }

    @ButtonComponent({ id: "queueLoop" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onQueueLoop(interaction: ButtonInteraction, _: Client, guardData: { player: KazagumoPlayer }): Promise<void> {
        if (guardData.player.loop !== "queue") guardData.player.setLoop("queue");
        else guardData.player.setLoop("none");
        await this.render(interaction);
    }

    @ButtonComponent({ id: "shuffle" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onShuffle(interaction: ButtonInteraction, _: Client, guardData: { player: KazagumoPlayer }): Promise<void> {
        guardData.player.queue.shuffle();
        await this.render(interaction);
    }

    @ButtonComponent({ id: "247" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async on247(interaction: ButtonInteraction, _: Client, guardData: { player: KazagumoPlayer }): Promise<void> {
        await GuildSetting.findOneAndUpdate({
            id: interaction.guildId
        }, {
            $set: { alwaysOn: !(await getGuildSetting(interaction.guildId)).alwaysOn }
        });
        await this.render(interaction);
    }

    @ButtonComponent({ id: "restart" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onRestart(interaction: ButtonInteraction, _: Client, guardData: { player: KazagumoPlayer }): Promise<void> {
        const joined: KazagumoTrack[] = [...guardData.player.prev, ...guardData.player.queue];
        guardData.player.prev = [];
        guardData.player.queue.clear();
        guardData.player.queue.add(joined);
        await guardData.player.play(guardData.player.queue.shift(), { replaceCurrent: true });
        await this.render(interaction);
    }

    private async render(interaction: CommandInteraction | ButtonInteraction): Promise<void> {
        const player: KazagumoPlayer = interaction.client.music.getPlayer(interaction.guildId);

        const { current } = player.queue;

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

        const row2: ActionRowBuilder = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("trackLoop")
                    .setLabel("🔂")
                    .setStyle(player.loop === "track" ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("queueLoop")
                    .setLabel("🔁")
                    .setStyle(player.loop === "queue" ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("247")
                    .setLabel("🔄️")
                    .setStyle(guildSetting.alwaysOn ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("shuffle")
                    .setLabel("🔀"),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("restart")
                    .setLabel("↩️")
            );

        await interaction.editReply({
            embeds: [embed],
            // @ts-ignore
            components: [row1, row2]
        });
    }
}