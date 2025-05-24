#!/bin/bash
# 创建项目根目录
mkdir hubu-campus-platform
cd hubu-campus-platform

# 创建前端目录
mkdir frontend
cd frontend
npx create-react-app . --template typescript
cd ..

# 创建后端目录
mkdir backend
cd backend
npm init -y
cd ..

# 创建文档目录
mkdir docs
mkdir docs/api
mkdir docs/design

# 创建配置文件目录
mkdir config
mkdir scripts

echo "项目结构创建完成！"