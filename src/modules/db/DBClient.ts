(await import("dotenv")).config();
import { Mongoose, connect } from "mongoose";

export class DBClient {
    private static _CLIENT: Promise<Mongoose> = connect(process.env.MONGODB_URL, {
        dbName: process.env.MONGODB_DBNAME
    });

    public static getClient(): Promise<Mongoose> {
        return this._CLIENT;
    }
}