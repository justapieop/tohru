import { ArgsOf, Client, Discord, On } from "discordx";

@Discord()
export class InteractionCreate {
    @On({ event: "interactionCreate" })
    public async onInteractionCreate([interaction]: ArgsOf<"interactionCreate">, client: Client): Promise<void> {
        await client.executeInteraction(interaction);
    }
}