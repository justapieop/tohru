import { Colors, CommandInteraction, Message } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class Ping {
    @Slash({ name: "ping", description: "Show how long it takes for Tohru to fly from Kobayashi's home." })
    public async ping(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply();
        const wsPing: number = interaction.client.ws.ping;

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