import { css } from 'lit';

/**
 * CGoUI 2.2 液态玻璃共享微光与光学样式库 (Liquid Glass Shared Styles)
 * 遵循 Ponytail / YAGNI 复用规范：消除跨 Web Components 样式孤岛与重复字面量维护。
 */

/**
 * Layer 0: SVG 折射与高斯模糊滤镜通用层样式
 * 在所有含有 .glass-refraction 的组件中共享
 */
export const glassRefractionStyles = css`
    .glass-refraction {
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        backdrop-filter: var(--glass-backdrop-filter-surface, blur(14px) saturate(135%));
        -webkit-backdrop-filter: var(--glass-backdrop-filter-surface, blur(14px) saturate(135%));
        filter: var(--glass-refraction-filter, url(#glass-distortion));
        pointer-events: none;
        overflow: hidden;
        isolation: isolate;
    }
`;

/**
 * Layer 2: 控件级 1px 双轴微光描边规则 (适用于按钮、输入框触发器、徽章等)
 */
export const hairlineRimLightRules = css`
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background:
        linear-gradient(to right,
            rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 0,
            rgba(0, 0, 0, 0) var(--lg-rim-side, 3px),
            rgba(0, 0, 0, 0) calc(100% - var(--lg-rim-side, 3px)),
            rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 100%),
        linear-gradient(to bottom,
            rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.45)) 0,
            rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.45)) var(--lg-rim-hold, 1px),
            rgba(255, 255, 255, 0) 8px,
            rgba(0, 0, 0, 0.02) calc(100% - 4px),
            rgba(0, 0, 0, 0.12) 100%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 2;
    opacity: 0.64;
    transition: opacity var(--dur-fast, 140ms) ease;
`;

export const hairlineRimDarkRules = css`
    background:
        linear-gradient(to bottom,
            rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 1.5)) 0,
            rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 1.5)) 1px,
            rgba(255, 255, 255, 0) 8px,
            rgba(255, 255, 255, 0) calc(100% - 4px),
            rgba(255, 255, 255, 0.08) 100%);
`;

/**
 * Layer 2: Tier B 弱化单向微光描边规则 (适用于大底板、对话框、表格底板、下拉菜单浮层等)
 */
export const tierBRimWeakRules = css`
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(to bottom,
        rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.45 * 0.75)) 0,
        rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.45 * 0.75)) var(--lg-rim-hold, 1px),
        rgba(255, 255, 255, 0) var(--lg-rim-fade, 12px));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 2;
    opacity: 0.8;
`;

export const tierBRimWeakDarkRules = css`
    background: linear-gradient(to bottom,
        rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 0,
        rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 0.45 * 1.5)) 1px,
        rgba(255, 255, 255, 0) 8px);
`;

/**
 * Layer 2: Tier C / 卡片级完整双轴微光描边规则 (保留完整 lit 0.95 顶部光)
 */
export const tierCRimRules = css`
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background:
        linear-gradient(to right,
            rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 0,
            rgba(0, 0, 0, 0) var(--lg-rim-side, 4px),
            rgba(0, 0, 0, 0) calc(100% - var(--lg-rim-side, 4px)),
            rgba(0, 38, 59, var(--lg-rim-dark, 0.04)) 100%),
        linear-gradient(to bottom,
            rgba(255, 255, 255, var(--lg-rim-lit, 0.95)) 0,
            rgba(255, 255, 255, var(--lg-rim-lit, 0.95)) var(--lg-rim-hold, 1px),
            rgba(255, 255, 255, 0) var(--lg-rim-fade, 12px),
            rgba(255, 255, 255, 0) calc(100% - var(--lg-rim-fade, 12px)),
            rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.4)) calc(100% - var(--lg-rim-hold, 1px)),
            rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.95) * 0.4)) 100%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 2;
    opacity: 0.95;
`;

export const tierCRimDarkRules = css`
    background:
        linear-gradient(to bottom,
            rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 1.5)) 0,
            rgba(255, 255, 255, calc(var(--lg-rim-lit, 0.22) * 1.5)) 1px,
            rgba(255, 255, 255, 0) 8px,
            rgba(255, 255, 255, 0) calc(100% - 4px),
            rgba(255, 255, 255, 0.12) 100%);
`;

/**
 * Layer 1: Tier B 半透明高不透明衬底 (0.9 固定)
 */
export const tierBPanelUnderlayRules = css`
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
    background: var(--glass-bg-panel, rgba(255, 255, 255, 0.9));
    pointer-events: none;
    transition: background-color 0.25s ease;
`;

export const tierBPanelUnderlayDarkRules = css`
    background: var(--glass-bg-panel, rgba(31, 32, 34, 0.9));
`;

/**
 * Layer 1: Tier C 半透明强调表面衬底 (0.72 固定，与 <cgo-card> 完全一致)
 */
export const tierCSurfaceUnderlayRules = css`
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
    background: var(--glass-bg-surface, rgba(255, 255, 255, 0.72));
    pointer-events: none;
    transition: background-color 0.25s ease;
`;

export const tierCSurfaceUnderlayDarkRules = css`
    background: var(--glass-bg-surface, rgba(31, 32, 34, 0.72));
`;
