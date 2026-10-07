/**
 * 抖音解析器前端配置
 * 您的 GitHub Pages: https://25gd1.github.io/Douyin
 * 
 * 配置步骤:
 * 1. 修改下面的 BACKEND_URL 为你的后端服务器地址
 * 2. 将文件推送到 GitHub 仓库
 * 3. 访问 https://25gd1.github.io/Douyin/ 测试功能
 */

// ============================================================
// 重要！请在此处设置您的后端服务器地址
// 例如：
// - 本地测试：const BACKEND_URL = 'http://localhost:3000';
// - 远程服务器：const BACKEND_URL = 'https://your-api-server.com';
// - 如果你有 API 子路径：const BACKEND_URL = 'https://your-domain.com/api';
// ============================================================

// ✅ 已部署到 Vercel 的后端地址
const BACKEND_URL = 'https://express-ijdaxahpd-hajimi9.vercel.app';

// 加载配置到全局
(function() {
    window.DOUYIN_CONFIG = {
        backendUrl: BACKEND_URL,
        version: '1.0.0',
        frontendUrl: 'https://25gd1.github.io/Douyin'
    };
    
    console.log('✅ 抖音解析器已加载');
    console.log('🔗 前端地址:', window.DOUYIN_CONFIG.frontendUrl);
    console.log('🔗 后端地址:', BACKEND_URL);
    console.log('⚡ Vercel 后端已就绪！');
})();