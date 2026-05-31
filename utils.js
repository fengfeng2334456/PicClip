// ===================================
// 工具函数模块
// ===================================

const Utils = {
    /**
     * 创建 Toast 提示
     */
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), CONFIG.UI.toastDuration);
    },

    /**
     * 创建下载链接
     * @param {Blob} blob - 文件数据
     * @param {string} filename - 文件名
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * 读取文件为 DataURL
     * @param {File} file - 文件对象
     * @returns {Promise<string>}
     */
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * 加载图片
     * @param {string} src - 图片源
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    },

    /**
     * 验证文件格式
     * @param {File} file - 文件对象
     * @returns {boolean}
     */
    isValidImageFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        return CONFIG.SITE.supportedFormats.includes(ext) && file.size <= CONFIG.SITE.maxFileSize;
    },

    /**
     * CRC32 计算
     * @param {Uint8Array} data - 数据
     * @returns {number}
     */
    crc32(data) {
        const table = new Uint32Array(256);
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            }
            table[i] = c;
        }
        let crc = 0xFFFFFFFF;
        for (let i = 0; i < data.length; i++) {
            crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
        }
        return crc ^ 0xFFFFFFFF;
    },

    /**
     * 创建 ZIP 文件
     * @param {Array<{name: string, blob: Blob}>} files - 文件列表
     * @returns {Promise<Blob>}
     */
    async createZip(files) {
        const encoder = new TextEncoder();
        let zipData = [];
        let centralDir = [];
        let offset = 0;

        for (const file of files) {
            const content = await file.blob.arrayBuffer();
            const bytes = new Uint8Array(content);
            const crc = this.crc32(bytes);

            // 本地文件头
            const header = new Uint8Array(30);
            header.set([0x50, 0x4B, 0x03, 0x04], 0); // 签名
            header.set([20, 0], 4); // 版本
            header.set([0, 0], 6); // 通用标志
            header.set([0, 0], 8); // 压缩方式（存储）
            header.set([0, 0, 0, 0], 10); // 修改时间/日期
            header.set([(crc >>> 0) & 0xFF, (crc >>> 8) & 0xFF, (crc >>> 16) & 0xFF, (crc >>> 24) & 0xFF], 14); // CRC-32
            header.set([content.byteLength & 0xFF, (content.byteLength >> 8) & 0xFF, (content.byteLength >> 16) & 0xFF, (content.byteLength >> 24) & 0xFF], 18); // 压缩后大小
            header.set([content.byteLength & 0xFF, (content.byteLength >> 8) & 0xFF, (content.byteLength >> 16) & 0xFF, (content.byteLength >> 24) & 0xFF], 22); // 未压缩大小
            header.set([file.name.length & 0xFF, (file.name.length >> 8) & 0xFF], 26); // 文件名长度
            header.set([0, 0], 28); // 额外字段长度

            zipData.push(header);
            zipData.push(encoder.encode(file.name));
            zipData.push(content);

            // 中央目录项
            const cdEntry = new Uint8Array(46);
            cdEntry.set([0x50, 0x4B, 0x01, 0x02], 0); // 签名
            cdEntry.set([20, 0], 4); // 创建版本
            cdEntry.set([20, 0], 6); // 需要版本
            cdEntry.set([0, 0], 8); // 通用标志
            cdEntry.set([0, 0], 10); // 压缩方式
            cdEntry.set([0, 0, 0, 0], 12); // 修改时间/日期
            cdEntry.set([(crc >>> 0) & 0xFF, (crc >>> 8) & 0xFF, (crc >>> 16) & 0xFF, (crc >>> 24) & 0xFF], 16); // CRC-32
            cdEntry.set([content.byteLength & 0xFF, (content.byteLength >> 8) & 0xFF, (content.byteLength >> 16) & 0xFF, (content.byteLength >> 24) & 0xFF], 20); // 压缩后大小
            cdEntry.set([content.byteLength & 0xFF, (content.byteLength >> 8) & 0xFF, (content.byteLength >> 16) & 0xFF, (content.byteLength >> 24) & 0xFF], 24); // 未压缩大小
            cdEntry.set([file.name.length & 0xFF, (file.name.length >> 8) & 0xFF], 28); // 文件名长度
            cdEntry.set([0, 0], 30); // 额外字段长度
            cdEntry.set([0, 0], 32); // 注释长度
            cdEntry.set([0, 0], 34); // 磁盘号开始
            cdEntry.set([0, 0], 36); // 内部文件属性
            cdEntry.set([0, 0, 0, 0], 38); // 外部文件属性
            cdEntry.set([offset & 0xFF, (offset >> 8) & 0xFF, (offset >> 16) & 0xFF, (offset >> 24) & 0xFF], 42); // 相对偏移

            centralDir.push(cdEntry);
            centralDir.push(encoder.encode(file.name));

            offset += header.length + file.name.length + content.byteLength;
        }

        // 中央目录结束标记
        const centralDirOffset = offset;
        const centralDirSize = centralDir.reduce((sum, item) => sum + item.length, 0);

        const eocd = new Uint8Array(22);
        eocd.set([0x50, 0x4B, 0x05, 0x06], 0); // 签名
        eocd.set([0, 0], 4); // 磁盘号
        eocd.set([0, 0], 6); // 中央目录所在磁盘号
        eocd.set([files.length & 0xFF, (files.length >> 8) & 0xFF], 8); // 本磁盘条目数
        eocd.set([files.length & 0xFF, (files.length >> 8) & 0xFF], 10); // 总条目数
        eocd.set([centralDirSize & 0xFF, (centralDirSize >> 8) & 0xFF, (centralDirSize >> 16) & 0xFF, (centralDirSize >> 24) & 0xFF], 12); // 中央目录大小
        eocd.set([centralDirOffset & 0xFF, (centralDirOffset >> 8) & 0xFF, (centralDirOffset >> 16) & 0xFF, (centralDirOffset >> 24) & 0xFF], 16); // 中央目录偏移
        eocd.set([0, 0], 20); // 注释长度

        // 合并所有部分
        const totalSize = zipData.reduce((sum, item) => sum + item.length, 0) + centralDirSize + eocd.length;
        const result = new Uint8Array(totalSize);
        let pos = 0;

        for (const item of zipData) {
            result.set(item instanceof ArrayBuffer ? new Uint8Array(item) : item, pos);
            pos += item.length;
        }
        for (const item of centralDir) {
            result.set(item instanceof ArrayBuffer ? new Uint8Array(item) : item, pos);
            pos += item.length;
        }
        result.set(eocd, pos);

        return new Blob([result], { type: 'application/zip' });
    }
};

// 导出工具模块
window.Utils = Utils;
