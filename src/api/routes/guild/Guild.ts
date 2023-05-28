import { Router, Get, Koa } from "@discordx/koa";
import { RouterContext } from "@koa/router";
import { Next } from "koa";

@Router({
    options: {
        prefix: "/guild"
    }
})
export class Guild {
    @Get("/:id")
    public async getGuildById(ctx: RouterContext, next: Next, koa: Koa): Promise<Next> {
        const res: any[] = await koa.bridge.broadcastEval(`this.guilds.cache.get("${ctx.params.id}")`);
        if (!res || !res.length) {
            ctx.status = 404.
            ctx.body = JSON.stringify({
                status: 404,
                message: "Not Found"
            });
        } else {
            ctx.status = 200;
            ctx.body = JSON.stringify({
                status: 200,
                message: "OK",
                data: res[0][0]
            });
        }
        return await next();
    }
}