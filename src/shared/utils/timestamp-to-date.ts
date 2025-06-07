export function timestampToDate(timestamp: { seconds: string; nanos: number }): Date {
    const millis = Number(timestamp.seconds) * 1000 + Math.floor(timestamp.nanos / 1_000_000);
    return new Date(millis);
}
