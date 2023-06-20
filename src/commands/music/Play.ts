import { CommandInteraction, ApplicationCommandOptionType, GuildMember, VoiceState, Colors, StageChannel } from "discord.js";
import { Client, Discord, Guard, Slash, SlashOption } from "discordx";
import { KazagumoPlayer, KazagumoSearchResult, KazagumoTrack } from "kazagumo";
import { Utils } from "../../utils/Utils.js";
import { Constants } from "../../utils/Constants.js";
import { InteractionGuards } from "../../guards/InteractionGuards.js";
import { GuildSettingSchema, getGuildSetting } from "../../modules/db/schemas/GuildSettings.js";
import { DefaultSettings } from "../../utils/DefaultSettings.js";

declare module "kazagumo" {
    export interface KazagumoPlayer {
        prev: KazagumoTrack[],
        skippedToPrev: boolean,
        filterStatus: {
            nightcore: boolean
        }
    }
}

@Discord()
export class Play {
    @Slash({ name: "play", description: "Lets Tohru sing for you." })
    @Guard(InteractionGuards.Defer)
    public async play(
        @SlashOption({
            name: "url",
            description: "Keyword or link to the track.",
            type: ApplicationCommandOptionType.String,
            required: true
        })
        url: string,
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        const member: GuildMember = await interaction.guild.members.fetch(interaction.user);
        const memVoice: VoiceState = member.voice;
        const botVoice: VoiceState = (await interaction.guild.members.fetchMe()).voice;

        const guildSetting: GuildSettingSchema = await getGuildSetting(interaction.guildId);

        let player: KazagumoPlayer = client.music.getPlayer(interaction.guildId);

        if (!memVoice.channelId) {
            await interaction.editReply({
                embeds: [
                    {
                        color: Colors.Red,
                        description: "❌ Please join a voice channel first!!"
                    }
                ]
            });
            return;
        } else {
            if (!botVoice.channelId || (botVoice.channelId === memVoice.channelId && !player))
                player = await client.music.createPlayer({
                    guildId: interaction.guildId,
                    voiceId: memVoice.channelId,
                    textId: interaction.channelId,
                    volume: guildSetting.defaultVolume,
                    deaf: true
                });
            else if (botVoice.channelId !== memVoice.channelId) {
                await interaction.editReply({
                    embeds: [
                        {
                            color: Colors.Red,
                            description: "❌ Please join the same voice channel with Tohru."
                        }
                    ]
                });
                return;
            }
        }

        const playable: boolean = !player.queue.current;

        let res: KazagumoSearchResult;

        if (Utils.checkURL(url)) {
            if (url.match(Constants.YOUTUBE_URL_REGEX)) {
                await interaction.editReply({
                    embeds: [
                        {
                            color: Colors.Red,
                            description: "❌ Unsupported provider."
                        }
                    ]
                });
                return;
            } else res = await player.search(url, { requester: member.id });
        } else res = await player.search(url, { requester: member.id, engine: "soundcloud" });

        if (res.tracks.length === 0) {
            await interaction.editReply({
                embeds: [
                    {
                        color: Colors.Red,
                        description: "❌ No tracks found."
                    }
                ]
            });
            return;
        }

        switch (res.type) {
            case "SEARCH":
            case "TRACK":
                const track: KazagumoTrack = res.tracks[0];
                player.queue.add(track);
                await interaction.editReply({
                    embeds: [
                        {
                            color: Colors.Green,
                            title: "Added track to queue",
                            description: `Requested by <@${track.requester}>`,
                            fields: [
                                {
                                    name: track.title,
                                    value: `${track.uri}\n➡ Author: ${track.author}`,
                                    inline: false
                                }
                            ]
                        }
                    ]
                });
                break;
            case "PLAYLIST":
                player.queue.add(res.tracks);
                await interaction.editReply({
                    embeds: [
                        {
                            color: Colors.Green,
                            title: "Added playlist to queue",
                            description: `Requested by <@${track.requester}>`,
                            fields: [
                                {
                                    name: res.playlistName,
                                    value: `Length: ${res.tracks.length} ${res.tracks.length > 1 ? "tracks" : "track"}`,
                                    inline: false
                                }
                            ]
                        }
                    ]
                });
                break;
        }

        if (playable) {
            if (memVoice.channel instanceof StageChannel) {
                await interaction.followUp({
                    embeds: [
                        {
                            color: Colors.Green,
                            description: "👋 Please allow me to speak on the stage."
                        }
                    ]
                });
            }
            player.skippedToPrev = false;
            player.prev = [];
            player.filterStatus = DefaultSettings.DEFAULT_FILTER_STATUS;
            await player.play(player.queue[0], { replaceCurrent: true });
        }
    }
}