import seedrandom from "seedrandom";

export const earliestDate = new Date(2024, 0, 1); // 2024/01/01
export const latestDate = new Date(2025, 0, 1); // 2025/01/01

export function getPseudoRandomDateBetween(start: Date, end: Date, seed: string): Date {
    const randomNumberGenerator = seedrandom(seed);

    return new Date(start.getTime() + randomNumberGenerator() * (end.getTime() - start.getTime()));
}
