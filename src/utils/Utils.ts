export class Utils {
    public static checkJSON(data: any): boolean {
        try {
            JSON.parse(data);
            return true;
        } catch (e: any) {
            return false;
        }
    }

    public static checkURL(s: string): boolean {
        try {
            new URL(s);
            return true;
        } catch (e: any) {
            return false;
        }
    }
}