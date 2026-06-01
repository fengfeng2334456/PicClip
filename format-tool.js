// ===================================
// 格式转换工具模块
// ===================================

const FormatTool = {
    // 状态
    images: [],
    processedBlobs: [],

    // DOM 元素
    el: {},

    /**
     * 初始化
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.bindFormatChips();
    },

    /**
     * 缓存 DOM 元素
     */
    cacheElements() {
        this.el = {
            uploadArea: document.getElementById('format-upload-area'),
            fileInput: document.getElementById('format-file-input'),
            fileList: document.getElementById('format-file-list'),
            resultList: document.getElementById('format-result-list'),
            targetFormat: document.getElementById('format-target'),
            qualitySlider: document.getElementById('format-quality'),
            qualityValue: document.getElementById('format-quality-value'),
            qualityWrap: document.getElementById('format-quality-wrap'),
            processBtn: document.getElementById('format-process-btn'),
            downloadBtn: document.getElementById('format-download-btn'),
            clearBtn: document.getElementById('format-clear-btn'),
            progressBar: document.getElementById('format-progress-bar'),
            progressText: document.getElementById('format-progress-text'),
            progressWrap: document.getElementById('format-progress-wrap'),
            resultCount: document.getElementById('format-result-count')
        };
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        const { uploadArea, fileInput, qualitySlider,
                processBtn, downloadBtn, clearBtn } = this.el;

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
     * 绑定格式选择芯片事件
     */
    bindFormatChips() {
        const chips = document.querySelectorAll('.format-format-chip');
        const targetSelect = this.el.targetFormat;
        const qualityWrap = this.el.qualityWrap;

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                // 移除所有选中状态
                chips.forEach(c => c.classList.remove('selected'));
                // 添加当前选中状态
                chip.classList.add('selected');

                // 更新隐藏的 select 值
                const format = chip.dataset.format;
                targetSelect.value = format;

                // PNG 不显示质量选项
                qualityWrap.style.display = (format === 'jpeg' || format === 'webp') ? 'block' : 'none';
            });
        });
    },

    /**
     * 格式化文件大小
     */
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    },

    /**
     * 添加文件
     */
    async addFiles(fileList) {
        for (const file of fileList) {
            if (!Utils.isValidImageFile(file)) continue;
            const dataUrl = await Utils.readFileAsDataURL(file);
            const img = await Utils.loadImage(dataUrl);
            this.images.push({ 
                file, 
                img, 
                name: file.name, 
                originalSize: file.size,
                dataUrl 
            });
        }

        this.renderFileList();

        if (this.images.length > 0) {
            this.el.processBtn.disabled = false;
        }
    },

    /**
     * 渲染文件列表
     */
    renderFileList() {
        const list = this.el.fileList;
        if (this.images.length === 0) {
            list.innerHTML = `<div class="format-empty-list">${I18n.t('format_no_images')}</div>`;
            return;
        }

        list.innerHTML = this.images.map((item, idx) => `
            <div class="format-file-item" data-index="${idx}">
                <img src="${item.dataUrl}" alt="${item.name}">
                <div class="format-file-info">
                    <span class="format-file-name" title="${item.name}">${item.name}</span>
                    <span class="format-file-size">${this.formatSize(item.originalSize)}</span>
                </div>
                <span class="format-file-remove" data-index="${idx}">&times;</span>
            </div>
        `).join('');

        list.querySelectorAll('.format-file-remove').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                this.images.splice(idx, 1);
                this.renderFileList();
                if (this.images.length === 0) {
                    this.el.processBtn.disabled = true;
                }
            });
        });
    },

    /**
     * 渲染结果列表
     */
    renderResultList() {
        const list = this.el.resultList;
        if (this.processedBlobs.length === 0) {
            list.innerHTML = `<div class="format-empty-list">${I18n.t('generated_placeholder')}</div>`;
            return;
        }

        list.innerHTML = this.processedBlobs.map((item, idx) => `
            <div class="format-result-item" data-index="${idx}">
                <img src="${item.dataUrl}" alt="${item.name}">
                <div class="format-result-info">
                    <span class="format-result-name" title="${item.name}">${item.name}</span>
                    <div class="format-size-compare">
                        <span class="size-original">${I18n.t('format_original')}: ${this.formatSize(item.originalSize)}</span>
                        <i class="fas fa-arrow-right"></i>
                        <span class="size-converted">${I18n.t('format_converted')}: ${this.formatSize(item.newSize)}</span>
                        <span class="size-${item.newSize < item.originalSize ? 'saved' : 'increased'}">
                            (${item.newSize < item.originalSize ? '-' : '+'}${this.formatSize(Math.abs(item.newSize - item.originalSize))})
                        </span>
                    </div>
                </div>
                <span class="format-result-download" data-index="${idx}" title="${I18n.t('download_btn')}">
                    <i class="fas fa-download"></i>
                </span>
            </div>
        `).join('');

        list.querySelectorAll('.format-result-download').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                const item = this.processedBlobs[idx];
                Utils.downloadBlob(item.blob, item.name);
            });
        });
    },

    /**
     * 批量处理
     */
    async processAll() {
        if (this.images.length === 0) {
            Utils.showToast(I18n.t('format_no_images'));
            return;
        }

        const btn = this.el.processBtn;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        this.processedBlobs = [];
        const total = this.images.length;
        const format = this.el.targetFormat.value;
        const quality = parseFloat(this.el.qualitySlider.value);
        const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
        const ext = format === 'jpeg' ? 'jpg' : format;

        this.el.progressWrap.style.display = 'block';

        for (let i = 0; i < total; i++) {
            const item = this.images[i];

            const blob = await new Promise(resolve => {
                const c = document.createElement('canvas');
                c.width = item.img.width;
                c.height = item.img.height;
                const ctx = c.getContext('2d');
                ctx.drawImage(item.img, 0, 0);
                c.toBlob(b => resolve(b), mimeType, quality);
            });

            const dataUrl = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(blob);
            });

            const baseName = item.name.replace(/\.[^.]+$/, '');
            this.processedBlobs.push({ 
                name: `${baseName}.${ext}`, 
                blob,
                dataUrl,
                originalSize: item.originalSize,
                newSize: blob.size
            });

            const pct = Math.round(((i + 1) / total) * 100);
            this.el.progressBar.style.width = pct + '%';
            this.el.progressText.textContent = `${i + 1} / ${total}`;

            await new Promise(r => setTimeout(r, 10));
        }

        this.renderResultList();
        this.el.resultCount.textContent = `${total} ${I18n.t('format_done')}`;
        this.el.downloadBtn.disabled = false;
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-exchange-alt"></i> <span>${I18n.t('format_process_btn')}</span>`;

        Utils.showToast(`${total} ${I18n.t('format_done')}`);
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
            const zip = await Utils.createZip(
                this.processedBlobs.map(item => ({
                    name: item.name,
                    blob: item.blob
                }))
            );
            Utils.downloadBlob(zip, 'converted_images.zip');
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
        this.renderFileList();
        this.el.resultList.innerHTML = `<div class="format-empty-list">${I18n.t('generated_placeholder')}</div>`;
    }
};

window.FormatTool = FormatTool;
