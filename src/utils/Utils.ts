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

    public static chunk<T>(a: T[], size: number): T[][] {
        return a.reduce((all: T[][], one: T, i: number) => {
            const ch: number = Math.floor(i / size);
            all[ch] = [].concat((all[ch] || []), one);
            return all;
        }, []);
    }

    public static shuffle<T>(arr: T[]): void {
        let last: number = arr.length;
        let n: number;
        while (last > 0) {
            n = 0 | Math.random() * last;
            this.swap(arr, n, --last);
        }
    }

    public static swap<T>(arr: T[], a: number, b: number): T[] {
        [arr[a], arr[b]] = [arr[b], arr[a]];
        return arr;
    }
}