export class DiscordUtils {

    static getRatingColor(rating: number): number {
        if (rating >= 4) return 0x00ff00; // green
        if (rating >= 3) return 0xffff00; // yellow
        if (rating >= 2) return 0xff8800; // orange
        return 0xff0000; // red
    }

    static truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    }
}
