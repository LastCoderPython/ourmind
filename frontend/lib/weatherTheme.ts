/**
 * Maps Emotional Weather states to soft pastel background colors.
 * These tones are designed for a mental wellness app — subtle and calming.
 */

export type WeatherState = 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Foggy';

const weatherColorMap: Record<WeatherState, string> = {
    Sunny: '#FFF6D6',  // warm yellow
    Cloudy: '#F3F4F6',  // neutral gray
    Rainy: '#E3F2FD',  // calm blue
    Stormy: '#FDECEA',  // soft red
    Foggy: '#F3E5F5',  // lavender
};

// Default color when weather is unknown or not yet loaded
export const DEFAULT_BG = '#FCF9F6'; // app-cream

export function getThemeFromWeather(weather: string | null | undefined): string {
    if (!weather) return DEFAULT_BG;

    // Normalize: the backend may return "sunny", "Sunny", "SUNNY", etc.
    const normalized = weather.charAt(0).toUpperCase() + weather.slice(1).toLowerCase();

    return weatherColorMap[normalized as WeatherState] || DEFAULT_BG;
}
