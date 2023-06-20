import { ApplicationCommandOptionType, Colors, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { GuildSetting, GuildSettingSchema, getGuildSetting } from "../../modules/db/schemas/GuildSettings.js";

@Discord()
export class DefaultVolume {
    @Slash({ name: "defaultvolume", description: "Sets the default volume on player creation." })
    public async onDefaultVolume(
        @SlashOption({
            name: "volume",
            description: "Volume from 0 - 200.",
            type: ApplicationCommandOptionType.Number,
            required: true,
            minValue: 0,
            maxValue: 200
        })
        volume: number,
        interaction: CommandInteraction,
    ): Promise<void> {
        const doc: GuildSettingSchema = await getGuildSetting(interaction.guildId);

        await GuildSetting.findOneAndUpdate({
            id: doc.id
        }, {
            $set: {
                defaultVolume: volume
            }
        });

        await interaction.editReply({
            embeds: [
                {
                    color: Colors.Green,
                    description: `✅ Default volume set to ${volume}.`
                }
            ]
        });
        return;
    }
}