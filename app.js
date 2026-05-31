// ===================================
// 主应用入口
// ===================================

const App = {
    /**
     * 初始化应用
     */
    init() {
        console.log('🚀 HC Tools initializing...');

        // 初始化各个模块
        this.initModules();

        // 更新国际化
        I18n.updatePage();

        console.log('✅ HC Tools initialized successfully');
    },

    /**
     * 初始化各个模块
     */
    initModules() {
        // 初始化导航
        Navigation.init();

        // 初始化 ICO 工具
        IcoTool.init();

        // 初始化去背景工具
        BgRemoverTool.init();

        // 初始化裁剪工具
        CropTool.init();
    }
};

// DOM 加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
