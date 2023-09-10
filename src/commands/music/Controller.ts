import prettyMs from "pretty-ms";
import { ButtonInteraction, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Discord, Slash, Guard, ButtonComponent, Client } from "discordx";
import { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import { InteractionGuards } from "../../guards/InteractionGuards.js";
import { MusicGuards } from "../../guards/MusicGuards.js";
import { Utils } from "../../utils/Utils.js";
import { client } from "../../modules/db/DBClient.js";
import { DefaultSettings } from "../../utils/DefaultSettings.js";

@Discord()
export class Controller {
    @Slash({ name: "controller", description: "Controls the music player." })
    @Guard(MusicGuards.RequireAvailablePlayer, InteractionGuards.Defer)
    public async controller(interaction: CommandInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        await this.render(interaction, { player });
    }

    @ButtonComponent({ id: "prev" })
    @Guard(MusicGuards.RequirePrevQueue)
    private async onPrev(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        if (player.queue.current)
            player.queue.unshift(player.queue.current);

        player.skippedToPrev = true;
        if (player.prev.length) player.play(player.prev.pop(), { noReplace: false });
        else {
            if (player.playing) player.shoukaku.stopTrack();
        }
        player.skippedToPrev = false;
        await this.render(interaction, { player });
    }

    @ButtonComponent({ id: "after" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onAfter(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        if (player.queue.length) player.play(player.queue.shift(), { noReplace: false });
        else {
            player.prev.push(player.queue.current);
            player.queue.current = null;
            player.shoukaku.stopTrack();
        }
        await this.render(interaction, { player });
    }

    @ButtonComponent({ id: "play" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onPlay(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        if (player.paused) player.pause(false);
        await this.render(interaction, { player });
    }

    @ButtonComponent({ id: "pause" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onPause(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        if (!player.paused) player.pause(true);
        await this.render(interaction, { player });
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
        await this.render(interaction, { player });
    }

    @ButtonComponent({ id: "queueLoop" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onQueueLoop(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        if (player.loop !== "queue") player.setLoop("queue");
        else player.setLoop("none");
        await this.render(interaction, { player });
    }

    @ButtonComponent({ id: "shuffle" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onShuffle(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        player.queue.shuffle();
        await this.render(interaction, { player });
    }

    @ButtonComponent({ id: "247" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async on247(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        const existing = await client.guildsettings.upsert({
            select: {
                alwaysOn: true
            },
            where: {
                id: interaction.guildId,
            },
            create: DefaultSettings.defaultGuildSetting(interaction.guildId),
            update: {}
        });

        await client.guildsettings.update({
            where: {
                id: interaction.guildId
            },
            data: {
                alwaysOn: !existing.alwaysOn
            }
        });
        await this.render(interaction, { player });
    }

    @ButtonComponent({ id: "restart" })
    @Guard(MusicGuards.RequireActivePlayer)
    private async onRestart(interaction: ButtonInteraction, _: Client, { player }: { player: KazagumoPlayer }): Promise<void> {
        const joined: KazagumoTrack[] = [...player.prev, ...player.queue];
        player.prev = [];
        player.queue.clear();
        player.queue.add(joined);
        await player.play(player.queue.shift(), { noReplace: false });
        await this.render(interaction, { player });
    }

    private async render(interaction: CommandInteraction | ButtonInteraction, { player }: { player: KazagumoPlayer }): Promise<void> {
        const { current } = player.queue;

        const guildSetting = await client.guildsettings.upsert({
            where: {
                id: interaction.guildId,
            },
            create: DefaultSettings.defaultGuildSetting(interaction.guildId),
            update: {}
        });

        const embed: EmbedBuilder = new EmbedBuilder()
            .setTitle("Now playing")
            .setDescription(`24/7 mode is ${guildSetting.alwaysOn ? "enabled" : "disabled"}`)
            .addFields(
                current ? {
                    name: current.title,
                    value: `${current.uri}\n➡ Uploader: ${current.author} | Requester: <@${current.requester}>`,
                    inline: false
                } : {
                    name: "No track is being played",
                    value: "Please add something to play",
                    inline: false
                }
            )
            .setFooter(current ? {
                text: prettyMs(player.shoukaku.position) + " "
                    + Utils.createProgressBar((player.shoukaku.position / player.queue.current.length) * 100, 12) + ` `
                    + prettyMs(player.queue.current.length)
            } : null);


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