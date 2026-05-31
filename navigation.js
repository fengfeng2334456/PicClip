// ===================================
// 页面导航与评分模块
// ===================================

const Navigation = {
    /**
     * 初始化导航
     */
    init() {
        this.bindEvents();
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 语言切换
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                I18n.setLang(btn.dataset.lang);
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                I18n.updatePage();
            });
        });

        // 评分功能
        this.initRating();
    },

    /**
     * 显示页面
     */
    showPage(pageName) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // 隐藏所有导航项激活状态
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        // 显示目标页面
        const page = document.getElementById('page-' + pageName);
        if (page) {
            page.classList.add('active');
        }

        // 激活对应导航项
        const navItem = document.querySelector(`[data-page="${pageName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
    },

    /**
     * 显示工具页面
     */
    showTool(toolName) {
        this.showPage(toolName);
    },

    /**
     * 初始化评分功能
     */
    initRating() {
        const stars = document.getElementById('rating-stars');
        const ratingText = document.getElementById('rating-text');
        const submitBtn = document.getElementById('rating-submit');
        const commentInput = document.getElementById('rating-comment');

        let currentRating = 0;

        // 星星点击事件
        stars.querySelectorAll('i').forEach(star => {
            star.addEventListener('click', () => {
                currentRating = parseInt(star.dataset.rating);
                this.updateStars(currentRating);
                const texts = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
                ratingText.textContent = currentRating ?
                    `${I18n.t('you_rated')} ${currentRating} - ${texts[currentRating]}` : '';
            });
        });

        // 提交评分
        submitBtn.addEventListener('click', () => {
            if (!currentRating) return;

            const comment = commentInput.value.trim();
            const ratings = JSON.parse(localStorage.getItem('hctools_ratings') || '[]');

            ratings.unshift({
                rating: currentRating,
                comment,
                date: new Date().toISOString()
            });

            // 最多保存 10 条
            if (ratings.length > 10) ratings.pop();

            localStorage.setItem('hctools_ratings', JSON.stringify(ratings));

            // 重置
            currentRating = 0;
            this.updateStars(0);
            ratingText.textContent = '';
            commentInput.value = '';

            // 重新加载历史
            this.loadRatingHistory();

            Utils.showToast('Thank you for your rating!');
        });

        // 加载历史记录
        this.loadRatingHistory();
    },

    /**
     * 更新星星显示
     */
    updateStars(rating) {
        const stars = document.querySelectorAll('#rating-stars i');
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
    },

    /**
     * 加载评分历史
     */
    loadRatingHistory() {
        const ratings = JSON.parse(localStorage.getItem('hctools_ratings') || '[]');
        const list = document.getElementById('rating-list');

        if (ratings.length === 0) {
            list.innerHTML = '<p style="color: #999; text-align: center;">No ratings yet</p>';
            return;
        }

        list.innerHTML = ratings.map(r => `
            <div class="rating-item">
                <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                ${r.comment ? `<div class="comment">${this.escapeHtml(r.comment)}</div>` : ''}
                <div class="date">${new Date(r.date).toLocaleDateString()}</div>
            </div>
        `).join('');
    },

    /**
     * HTML 转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// 导出导航模块
window.Navigation = Navigation;

// 全局页面切换函数
function showPage(page) {
    Navigation.showPage(page);
}

function showTool(tool) {
    Navigation.showTool(tool);
}

// 初始化导航
document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
});
