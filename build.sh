#!/bin/bash

echo "开始构建湖南大学校园论坛系统..."

# 安装依赖
echo "安装依赖包..."
npm install

# 构建项目
echo "构建生产版本..."
npm run build

# 检查构建结果
if [ -d "build" ]; then
    echo "构建成功！"
    echo "构建文件位于 build/ 目录"
    echo ""
    echo "部署说明："
    echo "1. 将 build/ 目录中的所有文件上传到你的网站服务器"
    echo "2. 配置服务器支持单页应用(SPA)路由"
    echo "3. 如果使用nginx，添加以下配置："
    echo ""
    echo "   location / {"
    echo "       try_files \$uri \$uri/ /index.html;"
    echo "   }"
    echo ""
    echo "4. 本地预览：npm run preview"
else
    echo "构建失败！请检查错误信息。"
    exit 1
fi