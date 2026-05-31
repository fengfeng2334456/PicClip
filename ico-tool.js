// ===================================
// ICO 工具模块
// ===================================

const IcoTool = {
    // 状态
    sourceImage: null,
    generatedIcons: [],

    // DOM 元素
    elements: {},

    /**
     * 初始化 ICO 工具
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.renderSizeChips();
    },

    /**
     * 缓存 DOM 元素
     */
    cacheElements() {
        this.elements = {
            uploadArea: document.getElementById('ico-upload-area'),
            fileInput: document.getElementById('ico-file-input'),
            previewImg: document.getElementById('ico-preview-img'),
            uploadPlaceholder: document.getElementById('ico-upload-placeholder'),
            resultGrid: document.getElementById('ico-result-grid'),
            generateBtn: document.getElementById('ico-generate-btn'),
            downloadAllBtn: document.getElementById('ico-download-all-btn'),
            roundedToggle: document.getElementById('ico-rounded-toggle'),
            sizeChips: []
        };
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        const { uploadArea, fileInput, generateBtn, downloadAllBtn, roundedToggle } = this.elements;

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

        // 生成按钮
        generateBtn.addEventListener('click', () => this.generate());

        // 下载全部按钮
        downloadAllBtn.addEventListener('click', () => this.downloadAll());
    },

    /**
     * 渲染尺寸选择芯片
     */
    renderSizeChips() {
        const sizeSection = document.getElementById('ico-size-section');
        const sizeGrid = sizeSection.querySelector('.size-grid');
        sizeGrid.innerHTML = '';

        CONFIG.ICO.defaultSizes.forEach((size, index) => {
            const chip = document.createElement('div');
            chip.className = 'size-chip' + (CONFIG.ICO.defaultSelected.includes(size) ? ' selected' : '');
            chip.dataset.size = size;
            chip.innerHTML = `
                <div class="icon"><i class="fas fa-desktop"></i></div>
                <div class="size">${size}×${size}</div>
            `;
            chip.addEventListener('click', () => chip.classList.toggle('selected'));
            sizeGrid.appendChild(chip);
        });
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

        // 显示预览
        this.elements.previewImg.src = dataUrl;
        this.elements.previewImg.style.display = 'block';
        this.elements.uploadPlaceholder.style.display = 'none';

        // 启用生成按钮
        this.elements.generateBtn.disabled = false;

        // 清空之前的结果
        this.renderEmptyResult();
    },

    /**
     * 生成 ICO 文件
     */
    async generate() {
        if (!this.sourceImage) {
            Utils.showToast(I18n.t('no_image'));
            return;
        }

        const selectedSizes = Array.from(document.querySelectorAll('.size-chip.selected'))
            .map(chip => parseInt(chip.dataset.size));

        if (selectedSizes.length === 0) {
            Utils.showToast(I18n.t('no_size'));
            return;
        }

        const btn = this.elements.generateBtn;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        this.elements.resultGrid.innerHTML = '';
        this.generatedIcons = [];

        // 生成各种尺寸的 ICO
        for (const size of selectedSizes) {
            const canvas = this.createResizedCanvas(size);
            const icoBlob = this.createIcoBlob(canvas, size);

            this.generatedIcons.push({ size, blob: icoBlob });

            // 创建结果项
            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `
                <img src="${canvas.toDataURL('image/png')}" class="result-icon">
                <div class="result-size">${size}×${size}</div>
            `;
            item.addEventListener('click', () => {
                Utils.downloadBlob(icoBlob, `${size}×${size}.ico`);
            });
            this.elements.resultGrid.appendChild(item);
        }

        // 启用下载按钮
        this.elements.downloadAllBtn.disabled = false;

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sync-alt"></i> <span>' + I18n.t('generate_btn') + '</span>';

        Utils.showToast(`${selectedSizes.length} ${I18n.t('generated')}`);
    },

    /**
     * 创建调整大小后的画布
     */
    createResizedCanvas(size) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');

        const s = Math.min(this.sourceImage.width, this.sourceImage.height);
        ctx.drawImage(
            this.sourceImage,
            (this.sourceImage.width - s) / 2,
            (this.sourceImage.height - s) / 2,
            s, s,
            0, 0,
            size, size
        );

        // 应用圆角
        if (this.elements.roundedToggle.checked) {
            this.applyRoundedCorner(ctx, size);
        }

        return canvas;
    },

    /**
     * 应用圆角
     */
    applyRoundedCorner(ctx, size) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-in';
        const r = size * CONFIG.ICO.roundedCornerRatio;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(size - r, 0);
        ctx.quadraticCurveTo(size, 0, size, r);
        ctx.lineTo(size, size - r);
        ctx.quadraticCurveTo(size, size, size - r, size);
        ctx.lineTo(r, size);
        ctx.quadraticCurveTo(0, size, 0, size - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },

    /**
     * 创建 ICO 文件 Blob
     */
    createIcoBlob(canvas, size) {
        // 获取 PNG 数据
        const pngDataUrl = canvas.toDataURL('image/png');
        const pngBase64 = pngDataUrl.split(',')[1];
        const pngBytes = Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0));

        // ICO 文件头 (6 字节)
        const header = new Uint8Array([0, 0, 1, 0, 1, 0]);

        // ICO 目录项 (16 字节)
        const dir = new Uint8Array(16);
        dir[0] = size >= 256 ? 0 : size;  // 宽度
        dir[1] = size >= 256 ? 0 : size;  // 高度
        dir[2] = 0;  // 颜色数
        dir[3] = 0;  // 保留
        dir[4] = 1;  // 颜色平面
        dir[5] = 0;
        dir[6] = 32; // 每像素位数
        dir[7] = 0;

        // 数据大小
        const dataSize = pngBytes.length;
        dir[8] = dataSize & 0xFF;
        dir[9] = (dataSize >> 8) & 0xFF;
        dir[10] = (dataSize >> 16) & 0xFF;
        dir[11] = (dataSize >> 24) & 0xFF;

        // 数据偏移
        const offset = 22; // 6 + 16
        dir[12] = offset & 0xFF;
        dir[13] = (offset >> 8) & 0xFF;
        dir[14] = (offset >> 16) & 0xFF;
        dir[15] = (offset >> 24) & 0xFF;

        // 合并所有部分
        const icoData = new Uint8Array(22 + dataSize);
        icoData.set(header, 0);
        icoData.set(dir, 6);
        icoData.set(pngBytes, 22);

        return new Blob([icoData], { type: 'image/x-icon' });
    },

    /**
     * 下载全部
     */
    async downloadAll() {
        if (this.generatedIcons.length === 0) {
            Utils.showToast(I18n.t('no_icons'));
            return;
        }

        if (this.generatedIcons.length === 1) {
            // 单个文件直接下载
            const { size, blob } = this.generatedIcons[0];
            Utils.downloadBlob(blob, `${size}×${size}.ico`);
        } else {
            // 多个文件打包 ZIP
            const zip = await Utils.createZip(
                this.generatedIcons.map(g => ({
                    name: `${g.size}×${g.size}.ico`,
                    blob: g.blob
                }))
            );
            Utils.downloadBlob(zip, 'icons.zip');
        }

        Utils.showToast(I18n.t('download_success'));
    },

    /**
     * 渲染空结果
     */
    renderEmptyResult() {
        this.elements.resultGrid.innerHTML = `
            <div class="result-placeholder" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-magic" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                <span>${I18n.t('generated_placeholder')}</span>
            </div>
        `;
        this.elements.downloadAllBtn.disabled = true;
    }
};

// 导出 ICO 工具模块
window.IcoTool = IcoTool;
