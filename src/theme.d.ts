export type ThemeName = 'light' | 'dark';

export interface ThemePalette {
    primary: string;
    primaryHover: string;
    darkPrimary: string;
    darkPrimaryHover: string;
    textMain: string;
    darkTextMain: string;
    textLight: string;
    darkTextLight: string;
}

export interface ThemeColorConfig {
    baseColor: string;
    overrides: Partial<ThemePalette>;
    palette: ThemePalette;
}

export function autoStorageKey(): string;
export function setStorageKey(key: string): void;
export function getStorageKey(): string;
export function applyTheme(theme: ThemeName | string): void;
export function currentTheme(): string;
export function toggleTheme(): string;
export function resetToSystem(): string;
export function bindLegacyThemeButton(): void;
export function autoThemeColorStorageKey(): string;
export function setThemeColorStorageKey(key: string): void;
export function getThemeColorStorageKey(): string;
export function hexToRgb(hex: string): [number, number, number] | null;
export function rgbToHsl(r: number, g: number, b: number): [number, number, number];
export function hslToHex(h: number, s: number, l: number): string;
export function generateThemePalette(baseColor: string): ThemePalette | null;
export function setThemeColor(baseColor: string, overrides?: Partial<ThemePalette>): ThemePalette | null;
export function resetThemeColor(): void;
export function getThemeColor(): ThemeColorConfig | null;
export function initTheme(): void;
export function injectLiquidGlassFilter(): void;
export function setGlassMode(mode: 'flat' | 'blur' | 'liquid' | string): void;
export function getGlassMode(): string;
export function setDefaultGlassMode(mode: 'flat' | 'blur' | 'liquid' | string): void;
export function autoHeaderModeStorageKey(): string;
export function setHeaderModeStorageKey(key: string): void;
export function getHeaderModeStorageKey(): string;
export function setHeaderMode(mode: 'classic' | 'floating' | string): string;
export function getHeaderMode(): string;
export function toggleHeaderMode(): string;
export function setDefaultHeaderMode(mode: 'classic' | 'floating' | string): void;
