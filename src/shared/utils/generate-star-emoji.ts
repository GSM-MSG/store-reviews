export function generateStarEmoji(stars: number): string {
    const integerPart = Math.trunc(stars);
    const decimalPart = stars - Math.trunc(stars);

    const emoji = "🌕 ".repeat(integerPart);
    if (decimalPart > 0) {
        return emoji + "🌗";
    }
    return emoji;
}