#!/usr/bin/env bash
# 一键“上传”：转换 + 生成 songs.json + 提交 + 推送（自动触发 CF Pages 部署）
set -e
cd "$(dirname "$0")"

python3 sync.py

git add -A
git commit -m "Update songs $(date '+%F %H:%M')" || echo "nothing to commit"

GH_TOKEN_PUSH=$(gh auth token)
git -c credential.helper='!f() { echo username=x-access-token; echo "password=$GH_TOKEN_PUSH"; }; f' push origin main

echo "done -> https://music-5q2.pages.dev"
