# 《最后一矛》/ The Last Spear — Ch.1～Ch.4 完整垂直切片原型

红黑涂鸦风 HTML5 Canvas 动作原型。无构建，打开即可玩。**终章 Ch.4 蓝心开合已实装**，含结局 A/B。

## 在线游玩（HTTPS）

- **稳定地址（GitHub Pages）**：https://tomketang.github.io/the-last-spear-web/
- **临时镜像**：https://acidic-crest-ntcmv.ship.place/
- **CDN 镜像**：https://raw.githack.com/tomketang/the-last-spear-web/main/index.html
- **源码**：https://github.com/tomketang/the-last-spear-web

### 启用 GitHub Pages（只需一次）

Actions / API 无法代替仓库管理员首次开通 Pages（会报 `Resource not accessible by integration`）。请用浏览器登录 GitHub 后：

1. 打开 https://github.com/tomketang/the-last-spear-web/settings/pages
2. **Build and deployment → Source** 选 **Deploy from a branch**
3. **Branch** 选 **main**，文件夹选 **/ (root)**，点 **Save**
4. 等约 1～2 分钟，打开 https://tomketang.github.io/the-last-spear-web/

静态站已在 `main` 根目录（`index.html` + `game.js` + `.nojekyll`），无需 Actions 构建。

## 操作

| 动作 | 键盘 | 鼠标 |
|------|------|------|
| 移动 | `WASD` / 方向键 | — |
| 矛戳 | `J` / `Z` | 左键 |
| 盾轮格挡 | `K` / `X` | 右键 |
| 无限冲刺 | `空格` / `L` / `C` | — |
| 选章 | `1`/`2`/`3`/`4` | 点击章节卡片 |
| 开始 | `Enter` / `空格` | 点击画布 |

## 文件

- `index.html` — 入口
- `game.js` — 全部游戏逻辑（Ch.1～Ch.4）
- `.nojekyll` — 让 Pages 按纯静态站托管
