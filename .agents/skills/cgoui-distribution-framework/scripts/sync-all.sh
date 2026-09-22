#!/usr/bin/env bash
# ==============================================================================
# CGoUI 一键全项目构建与架构适配分发脚本
# 适用项目：CGo-OpenMap、CGo-Web-Tools、F_Space_Class、CGo-Web-Tools/map
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 自动定位包含各子项目的 GitHub 根目录（兼顾位于 workspace/.agents 与 CGoUI/.agents 两种路径）
if [ -d "$SCRIPT_DIR/../../../../CGoUI" ]; then
    ROOT_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
elif [ -d "$SCRIPT_DIR/../../../../../CGoUI" ]; then
    ROOT_DIR="$(cd "$SCRIPT_DIR/../../../../.." && pwd)"
elif [ -d "/Users/liuzihan/Documents/GitHub/CGoUI" ]; then
    ROOT_DIR="/Users/liuzihan/Documents/GitHub"
else
    echo "❌ 错误: 无法定位包含 CGoUI 的工程根目录"
    exit 1
fi

CGO_UI_DIR="$ROOT_DIR/CGoUI"
OPENMAP_DIR="$ROOT_DIR/CGo-OpenMap"
WEBTOOLS_DIR="$ROOT_DIR/CGo-Web-Tools"
MAP_DIR="$WEBTOOLS_DIR/map"
F_SPACE_DIR="$ROOT_DIR/F_Space_Class/web"

echo "========================================================"
echo " [CGoUI Sync-All] 开始跨项目构建与分发工作流"
echo " 根目录: $ROOT_DIR"
echo "========================================================"

# 1. 构建与校验 CGoUI
echo ""
echo "▶ 步骤 1/4: 编译并校验 CGoUI 上游源头产物..."
cd "$CGO_UI_DIR"
npm run build
npm test
npm run check
npm run build:site
echo "✔ CGoUI 编译与质量检查通过！"

# 2. 分发至 CGo-OpenMap
echo ""
echo "▶ 步骤 2/4: 同步至 CGo-OpenMap 并刷新 PWA / 静态缓存..."
cp "$CGO_UI_DIR/dist/cgo-ui.js" "$OPENMAP_DIR/core/cgo-ui.js"
cp "$CGO_UI_DIR/styles/cgo_clr.css" "$OPENMAP_DIR/css/cgo_clr.css"
cp "$CGO_UI_DIR/styles/cgo_element.css" "$OPENMAP_DIR/css/cgo_element.css"
cp "$CGO_UI_DIR/styles/cgo_ui.css" "$OPENMAP_DIR/css/cgo_ui.css"
cp "$CGO_UI_DIR/styles/cgo_components.css" "$OPENMAP_DIR/css/cgo_components.css"

TIMESTAMP=$(date +"%y%m%d.%H%M")
echo "  - 生成新时间戳版本号: $TIMESTAMP"

# 更新 sw.js
sed -i '' -E "s/const CACHE_NAME = 'cgo-openmap-v[0-9.]+';/const CACHE_NAME = 'cgo-openmap-v$TIMESTAMP';/g" "$OPENMAP_DIR/sw.js"

# 更新各入口 HTML 资源查询串
HTML_FILES=(
    "$OPENMAP_DIR/index.html"
    "$OPENMAP_DIR/main.html"
    "$OPENMAP_DIR/readme.html"
    "$OPENMAP_DIR/privacy.html"
    "$OPENMAP_DIR/city-editor/index.html"
    "$OPENMAP_DIR/drunk/index.html"
)

for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        sed -i '' -E "s/(\?v=)[0-9.]+/\\1$TIMESTAMP/g" "$file"
    fi
done

node -c "$OPENMAP_DIR/core/cgo-ui.js"
echo "✔ CGo-OpenMap 产物、sw.js 及 HTML 版本号已全部刷新！"

# 3. 同步至 CGo-Web-Tools 与 map
echo ""
echo "▶ 步骤 3/4: 同步至 CGo-Web-Tools 及 map 子项目..."
cd "$WEBTOOLS_DIR"
npm run sync:cgo-ui
npm run build:ui
npm run test:cgo-wm

cd "$MAP_DIR"
node scripts/ensure-cgo-ui-cache.mjs
echo "✔ CGo-Web-Tools 与 map 已完成依赖同步与缓存校验！"

# 4. 同步至 F_Space_Class
echo ""
echo "▶ 步骤 4/4: 同步至 F_Space_Class..."
cd "$F_SPACE_DIR"
npm run sync:cgo-ui
echo "✔ F_Space_Class public/cgoui/ 静态资产已全量对齐！"

echo ""
echo "========================================================"
echo " 🎉 全部 4 个项目的 CGoUI 适配分发与验证已圆满完成！"
echo "========================================================"
