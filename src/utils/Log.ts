import { pino, Logger } from "pino";
import { Constants } from "./Constants.js";
import PinoPretty from "pino-pretty";
import { Utils } from "./Utils.js";
import { ILogger } from "discordx";

export class Log {
    private static readonly _LOGGER: Logger = pino(
        {
            level: Constants.NODE_ENV_DEV ? "debug" : "info"
        },
        pino.multistream(
            [
                Utils.pinoFileStream("error", "./app.log"),
                Utils.pinoFileStream("debug", "./debug.log"),
                PinoPretty.default({
                    colorize: true,
                    translateTime: "SYS:isoDateTime"
                })
            ]
        )
    );

    public static get logger(): Logger { return this._LOGGER; }

    public static get dxHook(): ILogger {
        return {
            error: (...args: any[]) => {
                this.logger.error(String(args));
            },
            info: (...args: any[]) => {
                this.logger.info(String(args));
            },
            warn: (...args: any[]) => {
                this.logger.warn(String(args));
            },
            log: (...args: any[]) => {
                this.logger.info(String(args));
            },
        };
    };
}