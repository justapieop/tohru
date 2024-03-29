import { ButtonInteraction, Events } from "discord.js";
import { ArgsOf, Client, Discord, On } from "discordx";

@Discord()
export class InteractionCreate {
    @On({ event: Events.InteractionCreate })
    public async onInteractionCreate([interaction]: ArgsOf<Events.InteractionCreate>, client: Client): Promise<void> {
        if (interaction instanceof ButtonInteraction) {
            await interaction.deferUpdate();
        }
        await client.executeInteraction(interaction);
    }
}