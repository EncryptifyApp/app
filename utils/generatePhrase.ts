import { generate } from "random-words";

export async function generatePhrase(): Promise<string> {
    const words = generate(6);

    if (typeof words === "string") {
        // If it's a string, convert it to an array
        return [words].join(" ");
    } else {
        // It's already an array, so directly join it
        return words.join(" ");
    }
}
