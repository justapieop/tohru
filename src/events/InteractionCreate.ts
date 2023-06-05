import { ButtonInteraction } from "discord.js";
import { ArgsOf, Client, Discord, On } from "discordx";

@Discord()
export class InteractionCreate {
    @On({ event: "interactionCreate" })
    public async onInteractionCreate([interaction]: ArgsOf<"interactionCreate">, client: Client): Promise<void> {
        if (interaction instanceof ButtonInteraction) await interaction.deferUpdate();
        await client.executeInteraction(interaction);
    }
}