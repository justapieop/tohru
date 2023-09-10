import { PrismaClient } from "@prisma/client";

export class DBClient extends PrismaClient {
    public constructor() {
        super();
    }
}

export const client: DBClient = new DBClient();