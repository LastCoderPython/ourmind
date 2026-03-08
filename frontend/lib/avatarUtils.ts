// Deterministic avatar colors from nickname hash
const PALETTE = [
    ["#90B47A", "#F2C94C"], // sage → gold
    ["#9B88ED", "#F2994A"], // lavender → tangerine
    ["#F2C94C", "#F2994A"], // gold → tangerine
    ["#A67B5B", "#90B47A"], // terracotta → sage
    ["#9B88ED", "#90B47A"], // lavender → sage
    ["#F2994A", "#9B88ED"], // tangerine → lavender
    ["#90B47A", "#9B88ED"], // sage → lavender
    ["#F2C94C", "#A67B5B"], // gold → terracotta
    ["#A67B5B", "#9B88ED"], // terracotta → lavender
    ["#F2994A", "#90B47A"], // tangerine → sage
];

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export function getAvatarForNickname(nickname: string) {
    const hash = hashString(nickname);
    const pair = PALETTE[hash % PALETTE.length];
    const initials = nickname.slice(0, 2).toUpperCase();
    return {
        gradient: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`,
        initials,
        color1: pair[0],
        color2: pair[1],
    };
}
