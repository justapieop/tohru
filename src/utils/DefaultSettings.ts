
export class DefaultSettings {
    public static defaultGuildSetting(id: string) {
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