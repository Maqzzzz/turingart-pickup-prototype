# 发布成网页链接

这是一个纯前端静态网页，不需要后端服务。发布后，别人打开网页链接即可体验幻灯片与选片功能，并通过页面里的“导入文件”或“导入文件夹”选择自己电脑里的照片/视频。

## 推荐方式：GitHub Pages

GitHub Pages 更适合长期分享：链接不会因为临时上传过期，后续更新也只需要提交新文件。

1. 在 GitHub 新建一个仓库，例如 `turingart-prototype`。
2. 上传本项目里的所有文件和文件夹，确保仓库根目录能看到 `index.html`。
3. 进入仓库 `Settings` → `Pages`。
4. `Build and deployment` 选择 `Deploy from a branch`。
5. `Branch` 选择 `main`，目录选择 `/root`，保存。
6. 等待 1 到 2 分钟，GitHub 会生成一个类似 `https://用户名.github.io/turingart-prototype/` 的长期访问链接。

以后更新时，只要替换仓库里的文件，GitHub Pages 会自动更新这个链接。

## 备选方式：登录后的 Netlify

`https://app.netlify.com/drop` 的匿名临时链接不适合长期分享。使用 Netlify 时，请登录账号后创建站点，或在 Drop 发布后及时认领站点。

1. 登录 Netlify。
2. 创建新站点，上传本项目文件夹，或连接 GitHub 仓库。
3. 发布完成后使用 Netlify 生成的 `https://...netlify.app` 链接。
4. 后续更新推荐通过连接 GitHub 仓库自动部署。

## 备选方式：Vercel

1. 打开 `https://vercel.com/new` 并登录。
2. 导入这个项目文件夹或对应 GitHub 仓库。
3. Framework Preset 选择 `Other`。
4. Build Command 留空，Output Directory 使用当前目录。
5. 发布后复制 Vercel 生成的链接。

## 体验说明

- 网页不会上传用户选择的照片/视频到服务器。
- “导入文件”和“导入文件夹”只是让浏览器读取访问者自己电脑上的本地文件。
- 每个访问者都可以导入自己的文件进行体验。
- 如果浏览器拦截文件夹选择，建议使用 Chrome 或 Edge。
