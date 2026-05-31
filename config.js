// ===================================
// 模块化配置文件
// ===================================

const CONFIG = {
    // 网站配置
    SITE: {
        title: 'HC Tools',
        subtitle: 'Free Online Image Tools',
        maxFileSize: 10 * 1024 * 1024, // 10MB
        supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    },

    // ICO 工具配置
    ICO: {
        defaultSizes: [16, 32, 48, 64, 96, 128, 256, 512],
        defaultSelected: [256],
        roundedCornerRatio: 0.2,
        defaultRounded: false
    },

    // 去背景工具配置
    BG_REMOVER: {
        defaultTolerance: 15,
        minTolerance: 0,
        maxTolerance: 50
    },

    // 裁剪去水印工具配置
    CROP: {
        defaultFormat: 'png',
        defaultQuality: 0.92,
        supportedFormats: ['png', 'jpeg', 'webp'],

        // 预设模式
        presets: [
            { id: 'custom', name: 'Custom', cropBottom: 100, cropRight: 100, ratio: '1:1' }
        ],

        // 比例选项
        ratios: [
            { value: '1:1', label: '1:1', w: 1, h: 1 },
            { value: '4:3', label: '4:3', w: 4, h: 3 },
            { value: '3:4', label: '3:4', w: 3, h: 4 },
            { value: '16:9', label: '16:9', w: 16, h: 9 },
            { value: '9:16', label: '9:16', w: 9, h: 16 },
            { value: 'free', label: 'Free', w: 0, h: 0 }
        ]
    },

    // UI 配置
    UI: {
        toastDuration: 3000,
        gridCols: { desktop: 3, tablet: 2, mobile: 1 },
        resultGridCols: 4
    }
};

// 导出配置
window.CONFIG = CONFIG;
