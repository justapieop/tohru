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

    public static splitIntoNChunks<T>(a: T[], n: number): T[][] {
        const array: T[] = a.slice();
        const result: T[][] = Array.from({ length: n }, () => []);

        for (let i: number = 0; array.length; i = (i + 1) % n) {
            result[i].push(array.shift());
        }

        return result;
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

    public static createProgressBar(percent: number, characterCount: number = 10, emptyCharacter: string = "▱"): string {
        let value: number = percent;

        if (percent > 1) {
            value = percent / 100;
        }

        const fill: number = Math.round(value * characterCount);
        return `[${"▰".repeat(fill)}${emptyCharacter.repeat(
            characterCount - fill
        )}]`.slice(0, characterCount + 2);
    }

    public static stringToMs(str: string): number {
        const s: string[] = str.replaceAll(" ", "").split(":");

        let sum: number = 0, t = 0;

        for (let i: number = s.length - 1; i >= 0; i--) {
            t = Number(s[i]);
            if (i === s.length - 2) t *= 60;
            if (i === s.length - 3) t *= 3600;
            if (i === s.length - 4) t *= 24 * 3600;
            sum += t;
        }

        return sum * 1000;
    }
}
