import { LitElement, html, css } from 'lit';

/**
 * <cgo-spinner>
 * 环形加载指示器与进度圆环组件
 * 
 * 模式 (mode):
 * - mode="spinner" (默认) 加载旋转指示器
 * - mode="progress" 进度圆环
 * 
 * 尺寸 (size):
 * - size="sm" (20px)
 * - size="" (40px)
 * - size="lg" (60px)
 * - 或数字/自定义像素 (如 size="80")
 * 
 * Spinner 属性:
 * - speed="slow|medium|fast" (默认 medium)
 * - direction="cw|ccw" (默认 cw)
 * 
 * Progress 属性:
 * - fill-mode="fill|clear" (默认 fill)
 * - direction="cw|ccw" (默认 cw)
 * - value="0..100" (实时进度)
 * - duration="3000" 或 "3s" (设定时间自动过渡)
 * - show-text / show-percentage (显示百分比数字模式 vs 不显示百分比纯圆环模式)
 */
export class CgoSpinner extends LitElement {
    static properties = {
        mode: { type: String },
        size: { type: String },
        speed: { type: String },
        direction: { type: String },
        fillMode: { type: String, attribute: 'fill-mode' },
        value: { type: Number },
        duration: { type: String },
        showText: { type: Boolean, attribute: 'show-text' },
        showPercentage: { type: Boolean, attribute: 'show-percentage' },
    };

    static styles = css`
        :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            vertical-align: middle;
        }

        .spinner-container {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
        }

        .spinner-container.sm {
            width: 20px;
            height: 20px;
        }

        .spinner-container.lg {
            width: 60px;
            height: 60px;
        }

        svg {
            width: 100%;
            height: 100%;
            overflow: visible;
        }

        /* 背景轨道 */
        .track {
            fill: none;
            stroke: var(--border-color, #dee2e6);
            opacity: 0.4;
            stroke-width: 3.5;
        }

        .sm .track, .sm .indicator {
            stroke-width: 3;
        }

        .lg .track, .lg .indicator {
            stroke-width: 4;
        }

        /* 旋转指示器与进度指示器 */
        .indicator {
            fill: none;
            stroke: var(--primary-color, #006098);
            stroke-width: 3.5;
            stroke-linecap: round;
            transform-origin: 20px 20px;
        }

        /* Spinner 旋转动画 */
        .spin-cw {
            animation: spin-cw-anim var(--spin-duration, 1s) linear infinite;
        }

        .spin-ccw {
            animation: spin-ccw-anim var(--spin-duration, 1s) linear infinite;
        }

        @keyframes spin-cw-anim {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        @keyframes spin-ccw-anim {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(-360deg);
            }
        }

        /* 进度圆环样式与方向 */
        .progress-indicator {
            transition: stroke-dashoffset var(--dash-transition, 0.3s) ease;
        }

        .dir-cw {
            transform: rotate(-90deg);
        }

        .dir-ccw {
            transform: rotate(-90deg) scaleY(-1);
        }

        /* 百分比数字 */
        .progress-text {
            position: absolute;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-color, #212529);
            user-select: none;
            text-align: center;
            line-height: 1;
        }

        .sm .progress-text {
            font-size: 7px;
        }

        .lg .progress-text {
            font-size: 14px;
        }
    `;

    constructor() {
        super();
        this.mode = 'spinner';
        this.size = '';
        this.speed = 'medium';
        this.direction = 'cw';
        this.fillMode = 'fill';
        this.value = 0;
        this.duration = '';
        this.showText = false;
        this.showPercentage = false;

        this._animTimer = null;
        this._startTime = null;
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.duration) {
            this._checkAutoStartDuration();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._stopDurationAnim();
    }

    updated(changedProps) {
        if (changedProps.has('duration') && this.duration) {
            this._checkAutoStartDuration();
        }
    }

    _checkAutoStartDuration() {
        const ms = this._parseDurationMs(this.duration);
        if (ms > 0) {
            this.start(ms);
        }
    }

    _parseDurationMs(dur) {
        if (typeof dur === 'number') return dur;
        if (!dur) return 0;
        const str = String(dur).trim();
        if (str.endsWith('ms')) return parseFloat(str) || 0;
        if (str.endsWith('s')) return (parseFloat(str) || 0) * 1000;
        return parseFloat(str) || 0;
    }

    /**
     * 自动开始指定时长的进度过渡
     * @param {number|string} durationMs 时长(毫秒或'3s')
     */
    start(durationMs) {
        const ms = durationMs ? this._parseDurationMs(durationMs) : this._parseDurationMs(this.duration);
        if (ms <= 0) return;

        this._stopDurationAnim();

        this.value = 0;
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / ms);
            this.value = Math.round(progress * 100);

            this.dispatchEvent(
                new CustomEvent('cgo-progress-change', {
                    detail: { value: this.value },
                    bubbles: true,
                    composed: true,
                })
            );

            if (progress < 1) {
                this._animTimer = requestAnimationFrame(step);
            } else {
                this._animTimer = null;
                this.dispatchEvent(
                    new CustomEvent('cgo-progress-complete', {
                        detail: { value: this.value },
                        bubbles: true,
                        composed: true,
                    })
                );
            }
        };

        this._animTimer = requestAnimationFrame(step);
    }

    /**
     * 停止自动过渡
     */
    _stopDurationAnim() {
        if (this._animTimer) {
            cancelAnimationFrame(this._animTimer);
            this._animTimer = null;
        }
    }

    /**
     * 重置进度
     */
    reset() {
        this._stopDurationAnim();
        this.value = 0;
    }

    /**
     * 手动设定进度值
     * @param {number} val (0-100)
     */
    setValue(val) {
        this._stopDurationAnim();
        this.value = val;
    }

    _getNormalizedMode() {
        if (this.mode === 'progress' || this.hasAttribute('value') || this.hasAttribute('duration')) {
            return 'progress';
        }
        return 'spinner';
    }

    _getNormalizedSpeed() {
        const s = (this.speed || '').toLowerCase();
        if (s === 'slow' || s === 'slow速' || s === '慢') return '2s';
        if (s === 'fast' || s === 'fast速' || s === '快') return '0.5s';
        return '1s'; // medium / default
    }

    _getNormalizedDirection() {
        const d = (this.direction || '').toLowerCase();
        if (d === 'ccw' || d === 'counterclockwise' || d === 'counter-clockwise' || d === '逆时针') {
            return 'ccw';
        }
        return 'cw'; // default
    }

    _getNormalizedFillMode() {
        const f = (this.fillMode || '').toLowerCase();
        if (f === 'clear' || f === '清空') {
            return 'clear';
        }
        return 'fill'; // default
    }

    _getNormalizedValue() {
        let v = parseFloat(this.value);
        if (isNaN(v)) v = 0;
        if (v > 0 && v <= 1) v = v * 100;
        return Math.min(100, Math.max(0, v));
    }

    _shouldShowText() {
        return this.showText || this.showPercentage || this.hasAttribute('show-text') || this.hasAttribute('show-percentage');
    }

    render() {
        const mode = this._getNormalizedMode();
        const dir = this._getNormalizedDirection();
        const sizeClass = ['sm', 'lg'].includes(this.size) ? this.size : '';
        const customSizeStyle =
            this.size && !['sm', 'lg'].includes(this.size)
                ? `width: ${typeof this.size === 'number' || !isNaN(this.size) ? `${this.size}px` : this.size}; height: ${typeof this.size === 'number' || !isNaN(this.size) ? `${this.size}px` : this.size};`
                : '';

        // 圆形几何参数 (半径 r=16, 周长 C ≈ 100.531)
        const radius = 16;
        const circumference = 2 * Math.PI * radius; // 100.5309649

        if (mode === 'spinner') {
            const speedDuration = this._getNormalizedSpeed();
            const animClass = dir === 'ccw' ? 'spin-ccw' : 'spin-cw';
            const dashArray = `${circumference * 0.25} ${circumference * 0.75}`;

            return html`
                <div class="spinner-container ${sizeClass}" style="${customSizeStyle}">
                    <svg viewBox="0 0 40 40">
                        <circle class="track" cx="20" cy="20" r="${radius}"></circle>
                        <circle
                            class="indicator ${animClass}"
                            cx="20"
                            cy="20"
                            r="${radius}"
                            stroke-dasharray="${dashArray}"
                            style="--spin-duration: ${speedDuration};"
                        ></circle>
                    </svg>
                </div>
            `;
        }

        // Progress 模式
        const fillMode = this._getNormalizedFillMode();
        const val = this._getNormalizedValue();
        const progressFrac = val / 100;

        let filledFrac;
        if (fillMode === 'fill') {
            // 填色模式：从 0 增加到 val
            filledFrac = progressFrac;
        } else {
            // 清空模式：从 100% 减少 (1 - progressFrac)
            filledFrac = 1 - progressFrac;
        }

        const strokeDashoffset = circumference * (1 - filledFrac);
        const dirClass = dir === 'ccw' ? 'dir-ccw' : 'dir-cw';
        const transitionDuration = this._animTimer ? '0.05s' : '0.3s';

        return html`
            <div class="spinner-container ${sizeClass}" style="${customSizeStyle}">
                <svg viewBox="0 0 40 40">
                    <circle class="track" cx="20" cy="20" r="${radius}"></circle>
                    <circle
                        class="indicator progress-indicator ${dirClass}"
                        cx="20"
                        cy="20"
                        r="${radius}"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${strokeDashoffset}"
                        style="--dash-transition: ${transitionDuration};"
                    ></circle>
                </svg>
                ${this._shouldShowText() ? html`<span class="progress-text">${Math.round(val)}%</span>` : ''}
            </div>
        `;
    }
}

if (typeof window !== 'undefined' && window.customElements) {
    customElements.get('cgo-spinner') || customElements.define('cgo-spinner', CgoSpinner);
}
