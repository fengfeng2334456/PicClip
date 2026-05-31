// ===================================
// 去背景工具模块
// ===================================

const BgRemoverTool = {
    // 状态
    sourceImage: null,
    resultCanvas: null,

    // DOM 元素
    elements: {},

    /**
     * 初始化去背景工具
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateToleranceDisplay();
    },

    /**
     * 缓存 DOM 元素
     */
    cacheElements() {
        this.elements = {
            uploadArea: document.getElementById('bg-upload-area'),
            fileInput: document.getElementById('bg-file-input'),
            originalPreview: document.getElementById('bg-original-preview'),
            originalPlaceholder: document.getElementById('bg-original-placeholder'),
            resultPreview: document.getElementById('bg-result-preview'),
            resultPlaceholder: document.getElementById('bg-result-placeholder'),
            toleranceSlider: document.getElementById('bg-tolerance-slider'),
            toleranceValue: document.getElementById('bg-tolerance-value'),
            processBtn: document.getElementById('bg-process-btn'),
            downloadBtn: document.getElementById('bg-download-btn')
        };
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        const { uploadArea, fileInput, toleranceSlider, processBtn, downloadBtn } = this.elements;

        // 上传事件
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', e => {
            if (e.target.files[0]) this.loadImage(e.target.files[0]);
        });
        uploadArea.addEventListener('dragover', e => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', e => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files[0]) this.loadImage(e.dataTransfer.files[0]);
        });

        // 容差滑块
        toleranceSlider.addEventListener('input', () => this.updateToleranceDisplay());

        // 处理按钮
        processBtn.addEventListener('click', () => this.process());

        // 下载按钮
        downloadBtn.addEventListener('click', () => this.download());
    },

    /**
     * 更新容差显示
     */
    updateToleranceDisplay() {
        this.elements.toleranceValue.textContent = this.elements.toleranceSlider.value;
    },

    /**
     * 加载图片
     */
    async loadImage(file) {
        if (!Utils.isValidImageFile(file)) {
            Utils.showToast('Invalid file format or size too large');
            return;
        }

        const dataUrl = await Utils.readFileAsDataURL(file);
        const img = await Utils.loadImage(dataUrl);

        this.sourceImage = img;

        // 显示原图预览
        this.elements.originalPreview.src = dataUrl;
        this.elements.originalPreview.style.display = 'block';
        this.elements.originalPlaceholder.style.display = 'none';

        // 重置结果预览
        this.elements.resultPreview.style.display = 'none';
        this.elements.resultPlaceholder.style.display = 'block';

        // 启用处理按钮，禁用下载按钮
        this.elements.processBtn.disabled = false;
        this.elements.downloadBtn.disabled = true;
    },

    /**
     * 处理图片 - 去除背景
     */
    async process() {
        if (!this.sourceImage) return;

        const btn = this.elements.processBtn;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        // 使用 requestAnimationFrame 避免 UI 阻塞
        await new Promise(resolve => requestAnimationFrame(resolve));

        const tolerance = parseInt(this.elements.toleranceSlider.value);
        this.resultCanvas = this.removeBackground(this.sourceImage, tolerance);

        // 显示结果预览
        this.elements.resultPreview.src = this.resultCanvas.toDataURL('image/png');
        this.elements.resultPreview.style.display = 'block';
        this.elements.resultPlaceholder.style.display = 'none';

        // 启用下载按钮
        this.elements.downloadBtn.disabled = false;

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> <span>' + I18n.t('process_btn') + '</span>';

        Utils.showToast(I18n.t('download_success'));
    },

    /**
     * 去除背景算法
     */
    removeBackground(img, tolerance) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 检测接近白色的像素
            if (r > 255 - tolerance &&
                g > 255 - tolerance &&
                b > 255 - tolerance) {
                // 计算与纯白色的欧几里得距离
                const distance = Math.sqrt(
                    Math.pow(255 - r, 2) +
                    Math.pow(255 - g, 2) +
                    Math.pow(255 - b, 2)
                );
                // 如果在容差范围内，设为透明
                if (distance <= tolerance * 1.73) {
                    data[i + 3] = 0;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    },

    /**
     * 下载结果
     */
    download() {
        if (!this.resultCanvas) return;

        this.resultCanvas.toBlob(blob => {
            Utils.downloadBlob(blob, 'transparent_image.png');
        }, 'image/png');
    }
};

// 导出去背景工具模块
window.BgRemoverTool = BgRemoverTool;
