// Vercel 会自动将此文件识别为后端接口：/api/sakura-config
export default function handler(req, res) {
    // 设置允许跨域（如果你本地测试需要）
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // 这里是你想要“保密”的动画核心参数
    const config = {
        petalCount: 40,           // 花瓣数量
        swingRange: 0.12,         // 晴天娃娃摆动幅度
        swingSpeed: 0.035,        // 摆动频率
        canvasScale: 6,           // 像素缩放倍率 (S)
        colors: {
            sky: '#e3f2fd',       // 天空颜色
            sakura: '#ffc0cb',    // 樱花粉
            grass: '#aed581',     // 草地绿
            dollBody: '#ffffff'   // 娃娃主体色
        },
        // 你甚至可以把文案也放在后端
        headerTitle: "晴空樱花",
        headerDesc: "这里是像素广工的宁静角落。远处的工学馆在晨雾中若隐若现，晴天娃娃正为你守护每一份好心情。"
    };

    // 发送 JSON 响应
    res.status(200).json(config);
}
