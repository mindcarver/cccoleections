#!/bin/bash

# Claude Code Features Collection - 自动部署脚本
# 使用方法：chmod +x deploy.sh && ./deploy.sh

set -e  # 遇到错误时退出

echo "🚀 Claude Code Features Collection - 自动部署脚本"
echo "=================================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Git是否安装
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git未安装，请先安装Git${NC}"
    exit 1
fi

echo -e "${BLUE}📋 检查项目文件...${NC}"

# 检查必要文件是否存在
required_files=("index.html" "styles/main.css" "js/app.js" "data/features.json")
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo -e "${RED}❌ 缺少必要文件: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ 所有必要文件都存在${NC}"

# 检查是否已经是Git仓库
if [[ ! -d ".git" ]]; then
    echo -e "${YELLOW}📝 初始化Git仓库...${NC}"
    git init
else
    echo -e "${BLUE}📁 Git仓库已存在${NC}"
fi

# 检查是否有远程仓库
if git remote get-url origin &> /dev/null; then
    echo -e "${BLUE}🔗 远程仓库已配置${NC}"
    remote_url=$(git remote get-url origin)
    echo -e "${BLUE}   远程地址: $remote_url${NC}"
else
    echo -e "${YELLOW}🔗 配置远程仓库...${NC}"
    read -p "请输入GitHub仓库URL (默认: https://github.com/mindcarver/cccoleections.git): " repo_url
    repo_url=${repo_url:-"https://github.com/mindcarver/cccoleections.git"}
    git remote add origin "$repo_url"
    echo -e "${GREEN}✅ 远程仓库已配置: $repo_url${NC}"
fi

# 添加所有文件
echo -e "${YELLOW}📦 添加项目文件...${NC}"
git add .

# 检查是否有变更
if git diff --staged --quiet; then
    echo -e "${BLUE}ℹ️  没有新的变更需要提交${NC}"
    
    # 检查是否有未推送的提交
    if git log origin/main..HEAD &> /dev/null 2>&1; then
        if [[ -n $(git log origin/main..HEAD --oneline) ]]; then
            echo -e "${YELLOW}📤 推送现有提交...${NC}"
            git push origin main
            echo -e "${GREEN}✅ 代码已推送到GitHub${NC}"
        else
            echo -e "${BLUE}ℹ️  所有提交都已同步${NC}"
        fi
    else
        echo -e "${YELLOW}📤 首次推送...${NC}"
        git branch -M main
        git push -u origin main
        echo -e "${GREEN}✅ 代码已推送到GitHub${NC}"
    fi
else
    echo -e "${YELLOW}💾 创建提交...${NC}"
    
    # 获取提交信息
    echo "请输入提交信息 (按Enter使用默认信息):"
    read -r commit_message
    
    if [[ -z "$commit_message" ]]; then
        commit_message="🚀 Update Claude Code Features Collection

✨ Features:
- 37+ Claude Code features with detailed descriptions
- Bilingual support (English/Chinese)  
- Interactive search and filtering
- Responsive design with dark/light themes
- Modern card-based UI
- GitHub Pages ready deployment

🛠️ Tech Stack:
- HTML5 + CSS3 + Vanilla JavaScript
- Modular component architecture
- No framework dependencies
- Performance optimized

📅 Updated: $(date +'%Y-%m-%d %H:%M:%S')"
    fi
    
    git commit -m "$commit_message"
    echo -e "${GREEN}✅ 提交已创建${NC}"
    
    # 推送到GitHub
    echo -e "${YELLOW}📤 推送到GitHub...${NC}"
    git branch -M main
    git push -u origin main
    echo -e "${GREEN}✅ 代码已推送到GitHub${NC}"
fi

echo ""
echo -e "${GREEN}🎉 部署脚本执行完成！${NC}"
echo ""
echo -e "${BLUE}📋 接下来的手动步骤：${NC}"
echo "1. 访问仓库设置页面启用GitHub Pages"
echo "2. 仓库设置地址 (自动打开): https://github.com/mindcarver/cccoleections/settings/pages"
echo "3. 选择 'Deploy from a branch' -> 'main' -> '/ (root)'"
echo "4. 保存设置后等待1-5分钟"
echo "5. 网站将在此地址可用: https://mindcarver.github.io/cccoleections/"
echo ""

# 尝试自动打开浏览器(可选)
if command -v python &> /dev/null; then
    echo -e "${YELLOW}🌐 尝试自动打开GitHub Pages设置页面...${NC}"
    python -c "import webbrowser; webbrowser.open('https://github.com/mindcarver/cccoleections/settings/pages')" 2>/dev/null || true
elif command -v python3 &> /dev/null; then
    echo -e "${YELLOW}🌐 尝试自动打开GitHub Pages设置页面...${NC}"
    python3 -c "import webbrowser; webbrowser.open('https://github.com/mindcarver/cccoleections/settings/pages')" 2>/dev/null || true
fi

echo -e "${GREEN}✅ 所有自动化步骤已完成！${NC}"
echo ""
echo -e "${BLUE}📊 项目统计：${NC}"
echo "- HTML文件: $(find . -name "*.html" | wc -l)"
echo "- CSS文件: $(find . -name "*.css" | wc -l)"  
echo "- JS文件: $(find . -name "*.js" | wc -l)"
echo "- JSON数据文件: $(find . -name "*.json" | wc -l)"
echo "- 总文件数: $(find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.json" -o -name "*.md" \) | wc -l)"

total_lines=$(find . -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.json" | xargs wc -l 2>/dev/null | tail -n 1 | awk '{print $1}' || echo "未知")
echo "- 总代码行数: $total_lines"

echo ""
echo -e "${YELLOW}⏰ 预计部署时间: 1-5分钟${NC}"
echo -e "${GREEN}🎯 部署完成后，网站将展示37个Claude Code功能特性！${NC}"