import { Colors, CommandInteraction, Message } from "discord.js";
import { Client, Discord, Guard, Slash } from "discordx";
import { InteractionGuards } from "../../guards/InteractionGuards.js";

@Discord()
export class Ping {
    @Slash({ name: "ping", description: "Show how long it takes for Tohru to fly from Kobayashi's home." })
    @Guard(InteractionGuards.Defer)
    public async ping(interaction: CommandInteraction, client: Client): Promise<void> {
        const wsPing: number = client.ws.ping;

        const msg: Message = await interaction.editReply({
            embeds: [
                {
                    color: Colors.Green,
                    description: "🏓 Pinging..."
                }
            ]
        });

        const ping: number = Math.abs(interaction.createdTimestamp - msg.createdTimestamp);

        await msg.edit({
            embeds: [
                {
                    color: Colors.Green,
                    description: `🏓 Ping: ${ping}ms\n🏓 Websocket Ping: ${wsPing}ms`
                }
            ]
        });
    }
}