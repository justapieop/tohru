import { Get, Koa, Router } from "@discordx/koa";
import { RouterContext } from "@koa/router";
import { Next } from "koa";

@Router()
export class Home {
    @Get("/")
    public async home(ctx: RouterContext, next: Next, _: Koa): Promise<Next> {
        ctx.status = 200;
        ctx.body = JSON.stringify({
            status: 200,
            message: "OK! Welcome to Tohru backend service."
        });
        return await next();
    }
}