import { getModelForClass, prop } from "@typegoose/typegoose";
import { NodeOption } from "shoukaku"

export class LavalinkNodeSchema implements NodeOption {
    @prop()
    public name: string;

    @prop()
    public url: string;

    @prop()
    public auth: string;

    @prop({ required: false })
    public secure?: boolean;

    @prop({ required: false })
    public group?: string;
}

export const LavalinkNode = getModelForClass(LavalinkNodeSchema, {
    options: {
        customName: "lavalinkNodes",
        automaticName: false
    }
});