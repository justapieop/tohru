import { GuildMember, StageChannel, VoiceBasedChannel } from "discord.js";
import { ArgsOf, Client, Discord, On } from "discordx";
import { KazagumoPlayer } from "kazagumo";
import { GuildSetting, GuildSettingSchema, getGuildSetting } from "../modules/db/schemas/GuildSettings.js";

@Discord()
export class VoiceStateUpdate {
    @On({ event: "voiceStateUpdate" })
    public async onVoiceStateUpdate([oldState, newState]: ArgsOf<"voiceStateUpdate">, client: Client): Promise<void> {
        const player: KazagumoPlayer = client.music.getPlayer(newState.guild.id);
        const self: GuildMember = await (oldState.guild ?? newState.guild).members.fetchMe();
        const guildSetting: GuildSettingSchema = await getGuildSetting((oldState ?? newState).guild.id);
        if (newState.channelId) {
            if (!oldState.channelId) {
                const channel: VoiceBasedChannel = newState.channel;
                if (channel instanceof StageChannel) {
                    if (!channel.topic) {
                        await channel.setTopic("Music with Tohru");
                    }
                    self.voice.setRequestToSpeak(true);
                }
            }
        }

        if (oldState.channelId && !newState.channelId) {
            if (oldState.channel.members.hasAny(self.id)) {
                if (oldState.channel.members.filter((m: GuildMember) => !m.user.bot)) {
                    if (guildSetting.alwaysOn) return;
                    if (player) player.destroy();
                    await self.voice.disconnect();
                }
            } else if (oldState.member === self) {
                await GuildSetting.findOneAndUpdate({
                    id: (oldState ?? newState).guild.id
                }, {
                    $set: {
                        alwaysOn: false
                    }
                });
                if (player) player.destroy();
                await self.voice.disconnect();
            }
        }
    }
}