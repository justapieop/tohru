import { format as fmt } from "fecha";
import { createLogger, Logger as WLogger, format, transports } from "winston";
import { Constants } from "./Constants.js";
import { Utils } from "./Utils.js";
import { ILogger } from "discordx";
import { RouterContext } from "@koa/router";
import { Next } from "koa";

export class Logger {
    private static readonly _LOGGER: WLogger = createLogger({
        level: Constants.NODE_ENV_DEV ? "debug" : "info",
        format: format.printf((info) => {
            let { message, level } = info;
            if (Utils.checkJSON(message))
                message = `[${fmt(new Date(), "YYYY-MM-DD HH:mm:ss")}][${level.toUpperCase()}]: ${JSON.stringify(message)}`;
            else message = `[${fmt(new Date(), "YYYY-MM-DD HH:mm:ss")}][${level.toUpperCase()}]: ${message}`;
            return message;
        }),
        transports: [
            new transports.Console(),
            new transports.File({ filename: "logs/info.log", level: "info" }),
            new transports.File({ filename: "logs/debug.log", level: "debug" })
        ]
    });

    public static getLogger(): WLogger {
        return this._LOGGER;
    }

    public static getDiscordxLogger(): ILogger {
        return {
            info: (...args: any[]) => {
                for (const s of args) {
                    if (Utils.checkJSON(s)) {
                        args[args.indexOf(s)] = JSON.stringify(s);
                    }
                }
                this._LOGGER.info(args.join());
            },
            warn: (...args: any[]) => {
                for (const s of args) {
                    if (Utils.checkJSON(s)) {
                        args[args.indexOf(s)] = JSON.stringify(s);
                    }
                }
                this._LOGGER.warn(args.join());
            },
            error: (...args: any[]) => {
                for (const s of args) {
                    if (Utils.checkJSON(s)) {
                        args[args.indexOf(s)] = JSON.stringify(s);
                    }
                }
                this._LOGGER.error(args.join());
            },
            log: (...args: any[]) => {
                for (const s of args) {
                    if (Utils.checkJSON(s)) {
                        args[args.indexOf(s)] = JSON.stringify(s);
                    }
                }
                this._LOGGER.log("debug", args.join());
            }
        }
    }

    public static async getKoaLogger(ctx: RouterContext, next: Next): Promise<Next> {
        Logger.getLogger().info(`[${ctx.url}]: ${ctx.request.method}.`);
        return await next();
    }
}