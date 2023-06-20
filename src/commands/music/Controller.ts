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
    private async onPrev(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        player.queue.unshift(player.queue.current);
        player.skippedToPrev = true;
        player.play(player.prev.pop(), { replaceCurrent: true });
        player.skippedToPrev = false;
        await this.render(interaction);
    }

    @ButtonComponent({ id: "after" })
    @Guard(MusicGuards.RequireActiveQueue)
    private async onAfter(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {

        player.play(player.queue.shift(), { replaceCurrent: true });
        await this.render(interaction);
    }

    @ButtonComponent({ id: "play" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onPlay(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        if (player.paused) player.pause(false);
        await this.render(interaction);
    }

    @ButtonComponent({ id: "pause" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onPause(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        if (!player.paused) player.pause(true);
        await this.render(interaction);
    }

    @ButtonComponent({ id: "stop" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onStop(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        player.destroy();
        await interaction.deleteReply();
    }

    @ButtonComponent({ id: "trackLoop" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onTrackLoop(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        if (player.loop !== "track") player.setLoop("track");
        else player.setLoop("none");
        await this.render(interaction);
    }

    @ButtonComponent({ id: "queueLoop" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onQueueLoop(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        if (player.loop !== "queue") player.setLoop("queue");
        else player.setLoop("none");
        await this.render(interaction);
    }

    @ButtonComponent({ id: "shuffle" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onShuffle(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        player.queue.shuffle();
        await this.render(interaction);
    }

    @ButtonComponent({ id: "247" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async on247(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        await GuildSetting.findOneAndUpdate({
            id: interaction.guildId
        }, {
            $set: { alwaysOn: !(await getGuildSetting(interaction.guildId)).alwaysOn }
        });
        await this.render(interaction);
    }

    @ButtonComponent({ id: "restart" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onRestart(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        const joined: KazagumoTrack[] = [...player.prev, ...player.queue];
        player.prev = [];
        player.queue.clear();
        player.queue.add(joined);
        await player.play(player.queue.shift(), { replaceCurrent: true });
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