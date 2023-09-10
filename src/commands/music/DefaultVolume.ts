import { ApplicationCommandOptionType, Colors, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { client } from "../../modules/db/DBClient.js";
import { DefaultSettings } from "../../utils/DefaultSettings.js";

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
        await client.guildsettings.upsert({
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
            select: {
                defaultVolume: true
            },
            where: {
                id: interaction.guildId,
            },
            data: {
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