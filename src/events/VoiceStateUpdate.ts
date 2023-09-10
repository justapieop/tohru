import { Events, GuildMember, StageChannel, VoiceBasedChannel } from "discord.js";
import { ArgsOf, Client, Discord, On } from "discordx";
import { KazagumoPlayer } from "kazagumo";
import { client as dbClient } from "../modules/db/DBClient.js";
import { DefaultSettings } from "../utils/DefaultSettings.js";

@Discord()
export class VoiceStateUpdate {
    @On({ event: Events.VoiceStateUpdate })
    public async onVoiceStateUpdate([oldState, newState]: ArgsOf<Events.VoiceStateUpdate>, client: Client): Promise<void> {
        const player: KazagumoPlayer = client.music.getPlayer(newState.guild.id);
        const self: GuildMember = await (oldState.guild ?? newState.guild).members.fetchMe();
        const guildSetting = await dbClient.guildsettings.upsert({
            where: {
                id: (oldState ?? newState).guild.id,
            },
            create: DefaultSettings.defaultGuildSetting((oldState ?? newState).guild.id),
            update: {}
        });
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
                if (oldState.channel.members.filter((m: GuildMember) => !m.user.bot).size === 0) {
                    if (guildSetting.alwaysOn) return;
                    if (player) player.destroy();
                    await self.voice.disconnect();
                }
            } else if (oldState.member === self) {
                await dbClient.guildsettings.update({
                    select: {
                        alwaysOn: true
                    },
                    where: {
                        id: (oldState ?? newState).guild.id
                    },
                    data: {
                        alwaysOn: false
                    }
                });
                if (player) player.destroy();
                await self.voice.disconnect();
            }
        }
    }
}