// ===================================
// 裁剪去水印工具模块
// ===================================

const CropTool = {
    // 状态
    images: [],
    processedBlobs: [],
    cropBottom: 100,
    cropRight: 100,
    currentRatio: '1:1',

    // DOM 元素
    el: {},

    /**
     * 初始化
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.renderRatios();
    },

    /**
     * 缓存 DOM 元素
     */
    cacheElements() {
        this.el = {
            uploadArea: document.getElementById('crop-upload-area'),
            fileInput: document.getElementById('crop-file-input'),
            fileList: document.getElementById('crop-file-list'),
            canvas: document.getElementById('crop-canvas'),
            canvasWrap: document.getElementById('crop-canvas-wrap'),
            previewCanvas: document.getElementById('crop-preview-canvas'),
            ratioContainer: document.getElementById('crop-ratios'),
            cropBottomInput: document.getElementById('crop-bottom'),
            cropRightInput: document.getElementById('crop-right'),
            formatSelect: document.getElementById('crop-format'),
            qualitySlider: document.getElementById('crop-quality'),
            qualityValue: document.getElementById('crop-quality-value'),
            qualityWrap: document.getElementById('crop-quality-wrap'),
            processBtn: document.getElementById('crop-process-btn'),
            downloadBtn: document.getElementById('crop-download-btn'),
            clearBtn: document.getElementById('crop-clear-btn'),
            progressBar: document.getElementById('crop-progress-bar'),
            progressText: document.getElementById('crop-progress-text'),
            progressWrap: document.getElementById('crop-progress-wrap'),
            resultCount: document.getElementById('crop-result-count')
        };
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        const { uploadArea, fileInput, formatSelect, qualitySlider,
                processBtn, downloadBtn, clearBtn, cropBottomInput, cropRightInput } = this.el;

        // 上传
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', e => {
            if (e.target.files.length) this.addFiles(e.target.files);
        });
        uploadArea.addEventListener('dragover', e => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
        uploadArea.addEventListener('drop', e => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) this.addFiles(e.dataTransfer.files);
        });

        // 像素输入变化时实时预览
        cropBottomInput.addEventListener('input', () => {
            this.cropBottom = parseInt(cropBottomInput.value) || 0;
            this.drawCanvas();
            this.updatePreview();
        });
        cropRightInput.addEventListener('input', () => {
            this.cropRight = parseInt(cropRightInput.value) || 0;
            this.drawCanvas();
            this.updatePreview();
        });

        // 格式切换
        formatSelect.addEventListener('change', () => {
            const fmt = formatSelect.value;
            this.el.qualityWrap.style.display = (fmt === 'jpeg' || fmt === 'webp') ? 'block' : 'none';
        });

        // 质量滑块
        qualitySlider.addEventListener('input', () => {
            this.el.qualityValue.textContent = Math.round(qualitySlider.value * 100) + '%';
        });

        // 按钮
        processBtn.addEventListener('click', () => this.processAll());
        downloadBtn.addEventListener('click', () => this.downloadAll());
        clearBtn.addEventListener('click', () => this.clearAll());
    },

    /**
     * 渲染比例选择
     */
    renderRatios() {
        const container = this.el.ratioContainer;
        container.innerHTML = '';

        CONFIG.CROP.ratios.forEach(ratio => {
            const chip = document.createElement('div');
            chip.className = 'crop-ratio-chip' + (ratio.value === this.currentRatio ? ' selected' : '');
            chip.dataset.ratio = ratio.value;
            chip.innerHTML = `<span>${ratio.label}</span>`;
            chip.addEventListener('click', () => {
                this.currentRatio = ratio.value;
                container.querySelectorAll('.crop-ratio-chip').forEach(c => c.classList.remove('selected'));
                chip.classList.add('selected');
                this.drawCanvas();
                this.updatePreview();
            });
            container.appendChild(chip);
        });
    },

    /**
     * 计算裁剪区域（像素坐标）
     */
    calcCropRect(img) {
        const bottom = Math.min(this.cropBottom, img.height - 1);
        const right = Math.min(this.cropRight, img.width - 1);

        // 第一步：去掉底部和右侧
        let srcW = img.width - right;
        let srcH = img.height - bottom;

        // 第二步：按比例裁剪
        const ratioConfig = CONFIG.CROP.ratios.find(r => r.value === this.currentRatio);
        if (ratioConfig && ratioConfig.w > 0 && ratioConfig.h > 0) {
            const targetRatio = ratioConfig.w / ratioConfig.h;
            const currentRatio = srcW / srcH;

            if (currentRatio > targetRatio) {
                // 图片太宽，裁左右
                const newW = srcH * targetRatio;
                const offsetX = (srcW - newW) / 2;
                return {
                    sx: offsetX,
                    sy: 0,
                    sw: newW,
                    sh: srcH
                };
            } else {
                // 图片太高，裁上下
                const newH = srcW / targetRatio;
                const offsetY = (srcH - newH) / 2;
                return {
                    sx: 0,
                    sy: offsetY,
                    sw: srcW,
                    sh: newH
                };
            }
        }

        // 自由比例
        return { sx: 0, sy: 0, sw: srcW, sh: srcH };
    },

    /**
     * 添加文件
     */
    async addFiles(fileList) {
        for (const file of fileList) {
            if (!Utils.isValidImageFile(file)) continue;
            const dataUrl = await Utils.readFileAsDataURL(file);
            const img = await Utils.loadImage(dataUrl);
            this.images.push({ file, img, name: file.name });
        }

        this.renderFileList();

        if (this.images.length > 0) {
            this.drawImageToCanvas(this.images[0].img);
        }

        this.el.processBtn.disabled = false;
    },

    /**
     * 渲染文件列表
     */
    renderFileList() {
        const list = this.el.fileList;
        if (this.images.length === 0) {
            list.innerHTML = `<div class="crop-empty-list">${I18n.t('crop_no_images')}</div>`;
            return;
        }

        list.innerHTML = this.images.map((item, idx) => `
            <div class="crop-file-item ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                <img src="${item.img.src}" alt="${item.name}">
                <span class="crop-file-name" title="${item.name}">${item.name}</span>
                <span class="crop-file-remove" data-index="${idx}">&times;</span>
            </div>
        `).join('');

        list.querySelectorAll('.crop-file-remove').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                this.images.splice(idx, 1);
                this.renderFileList();
                if (this.images.length > 0) {
                    this.drawImageToCanvas(this.images[0].img);
                } else {
                    this.clearCanvas();
                    this.el.processBtn.disabled = true;
                }
            });
        });

        list.querySelectorAll('.crop-file-item').forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.index);
                list.querySelectorAll('.crop-file-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.drawImageToCanvas(this.images[idx].img);
            });
        });
    },

    /**
     * 绘制图片到画布
     */
    drawImageToCanvas(img) {
        const canvas = this.el.canvas;
        const wrap = this.el.canvasWrap;
        const maxW = wrap.clientWidth || 500;
        const maxH = 350;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas._scale = scale;
        canvas._img = img;

        this.drawCanvas();
    },

    /**
     * 绘制画布（图片 + 裁剪框）
     */
    drawCanvas() {
        const canvas = this.el.canvas;
        const ctx = canvas.getContext('2d');
        const img = canvas._img;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!img) return;

        const scale = canvas._scale;

        // 绘制原图
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 计算裁剪区域
        const crop = this.calcCropRect(img);

        // 转换到画布坐标
        const cx = crop.sx * scale;
        const cy = crop.sy * scale;
        const cw = crop.sw * scale;
        const ch = crop.sh * scale;

        // 暗化裁剪区域外
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 清除裁剪区域内的暗色
        ctx.clearRect(cx, cy, cw, ch);
        ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, cx, cy, cw, ch);

        // 裁剪框边框
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(cx, cy, cw, ch);
        ctx.setLineDash([]);

        // 四角标记
        const cornerLen = Math.min(15, cw / 4, ch / 4);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, cy + cornerLen); ctx.lineTo(cx, cy); ctx.lineTo(cx + cornerLen, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + cw - cornerLen, cy); ctx.lineTo(cx + cw, cy); ctx.lineTo(cx + cw, cy + cornerLen); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy + ch - cornerLen); ctx.lineTo(cx, cy + ch); ctx.lineTo(cx + cornerLen, cy + ch); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + cw - cornerLen, cy + ch); ctx.lineTo(cx + cw, cy + ch); ctx.lineTo(cx + cw, cy + ch - cornerLen); ctx.stroke();

        // 尺寸标签
        const realW = Math.round(crop.sw);
        const realH = Math.round(crop.sh);
        ctx.fillStyle = 'rgba(39, 174, 96, 0.85)';
        const label = `${realW} × ${realH}`;
        ctx.font = '12px sans-serif';
        const tw = ctx.measureText(label).width;
        const labelY = cy + ch + 6;
        if (labelY + 22 < canvas.height) {
            ctx.fillRect(cx + cw / 2 - tw / 2 - 6, labelY, tw + 12, 20);
            ctx.fillStyle = '#fff';
            ctx.fillText(label, cx + cw / 2 - tw / 2, labelY + 14);
        }

        // 底部/右侧裁剪标注线
        if (this.cropBottom > 0) {
            const bottomY = (img.height - this.cropBottom) * scale;
            ctx.strokeStyle = 'rgba(231, 76, 60, 0.7)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(0, bottomY); ctx.lineTo(canvas.width, bottomY); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
            ctx.font = '11px sans-serif';
            ctx.fillText(`-${this.cropBottom}px`, 4, bottomY - 4);
        }
        if (this.cropRight > 0) {
            const rightX = (img.width - this.cropRight) * scale;
            ctx.strokeStyle = 'rgba(231, 76, 60, 0.7)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(rightX, 0); ctx.lineTo(rightX, canvas.height); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
            ctx.font = '11px sans-serif';
            ctx.fillText(`-${this.cropRight}px`, rightX + 4, 14);
        }
    },

    /**
     * 更新预览
     */
    updatePreview() {
        const previewCanvas = this.el.previewCanvas;
        const ctx = previewCanvas.getContext('2d');

        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        if (!this.el.canvas._img) return;

        const img = this.el.canvas._img;
        const crop = this.calcCropRect(img);

        const maxW = previewCanvas.parentElement.clientWidth || 300;
        const maxH = 200;
        const scale = Math.min(maxW / crop.sw, maxH / crop.sh, 1);

        previewCanvas.width = crop.sw * scale;
        previewCanvas.height = crop.sh * scale;

        ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, previewCanvas.width, previewCanvas.height);
    },

    /**
     * 批量处理
     */
    async processAll() {
        if (this.images.length === 0) {
            Utils.showToast(I18n.t('crop_no_images'));
            return;
        }

        const btn = this.el.processBtn;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        this.processedBlobs = [];
        const total = this.images.length;
        const format = this.el.formatSelect.value;
        const quality = parseFloat(this.el.qualitySlider.value);
        const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
        const ext = format === 'jpeg' ? 'jpg' : format;

        this.el.progressWrap.style.display = 'block';

        for (let i = 0; i < total; i++) {
            const item = this.images[i];
            const crop = this.calcCropRect(item.img);

            const blob = await new Promise(resolve => {
                const c = document.createElement('canvas');
                c.width = crop.sw;
                c.height = crop.sh;
                const ctx = c.getContext('2d');
                ctx.drawImage(item.img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, crop.sw, crop.sh);
                c.toBlob(b => resolve(b), mimeType, quality);
            });

            const baseName = item.name.replace(/\.[^.]+$/, '');
            this.processedBlobs.push({ name: `${baseName}_cropped.${ext}`, blob });

            const pct = Math.round(((i + 1) / total) * 100);
            this.el.progressBar.style.width = pct + '%';
            this.el.progressText.textContent = `${i + 1} / ${total}`;

            await new Promise(r => setTimeout(r, 10));
        }

        this.el.resultCount.textContent = `${total} ${I18n.t('crop_done')}`;
        this.el.downloadBtn.disabled = false;
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-crop-alt"></i> <span>${I18n.t('crop_process_btn')}</span>`;

        Utils.showToast(`${total} ${I18n.t('crop_done')}`);
    },

    /**
     * 下载全部
     */
    async downloadAll() {
        if (this.processedBlobs.length === 0) return;

        if (this.processedBlobs.length === 1) {
            const { name, blob } = this.processedBlobs[0];
            Utils.downloadBlob(blob, name);
        } else {
            const zip = await Utils.createZip(this.processedBlobs);
            Utils.downloadBlob(zip, 'cropped_images.zip');
        }

        Utils.showToast(I18n.t('download_success'));
    },

    /**
     * 清空全部
     */
    clearAll() {
        this.images = [];
        this.processedBlobs = [];
        this.el.fileInput.value = '';
        this.el.processBtn.disabled = true;
        this.el.downloadBtn.disabled = true;
        this.el.progressWrap.style.display = 'none';
        this.el.progressBar.style.width = '0%';
        this.el.progressText.textContent = '';
        this.el.resultCount.textContent = '';
        this.clearCanvas();
        this.renderFileList();
    },

    clearCanvas() {
        const ctx = this.el.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.el.canvas.width, this.el.canvas.height);
        const pCtx = this.el.previewCanvas.getContext('2d');
        pCtx.clearRect(0, 0, this.el.previewCanvas.width, this.el.previewCanvas.height);
    }
};

window.CropTool = CropTool;
