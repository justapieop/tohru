import { getModelForClass, prop } from "@typegoose/typegoose";
import { DefaultSettings } from "../../../utils/DefaultSettings.js";

export class GuildSettingSchema {
    @prop({ required: true })
    public id: string;

    @prop({ required: true })
    public alwaysOn: boolean;

    @prop({ required: true })
    public defaultVolume: number;
}

export const GuildSetting = getModelForClass(GuildSettingSchema, {
    options: {
        customName: "guildSettings",
        automaticName: false
    }
});

export async function getGuildSetting(id: string): Promise<GuildSettingSchema> {
    let data: GuildSettingSchema = await GuildSetting.findOne({ id });

    if (!data) {
        // @ts-ignore
        data = await GuildSetting.create(DefaultSettings.defaultGuildSetting(id));
    }

    return data;
}