import { GuildSettingSchema } from "../modules/db/schemas/GuildSettings.js";

export class DefaultSettings {
    public static defaultGuildSetting(id: string): GuildSettingSchema {
        return {
            id,
            alwaysOn: false,
            defaultVolume: 100
        };
    }

    public static readonly DEFAULT_FILTER_STATUS = {
        nightcore: false
    };
}