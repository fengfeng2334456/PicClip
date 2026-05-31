// ===================================
// 国际化模块 (i18n)
// ===================================

const I18n = {
    currentLang: localStorage.getItem('hctools_lang') || 'en',

    translations: {
        en: {
            // 导航
            nav_tools: 'Tools',
            nav_help: 'Help',
            nav_rating: 'Rating',

            // 首页
            home_title: 'Free Online Image Tools',
            home_subtitle: 'Click a tool to start processing your images',

            // ICO 工具
            ico_name: 'Image to ICO',
            ico_desc: 'Convert images to ICO icon format with multiple sizes support',
            ico_page_desc: 'Convert your images to ICO icon format',

            // 去背景工具
            bg_name: 'Remove Background',
            bg_desc: 'Make image background transparent with one click',
            bg_page_desc: 'Make your image background transparent',

            // 即将推出的工具
            tool3_name: 'Image Compress',
            tool3_desc: 'Reduce image file size without losing quality',
            tool4_name: 'Format Convert',
            tool4_desc: 'Convert images between PNG, JPG, WEBP formats',

            // 裁剪去水印工具
            crop_name: 'Crop & Remove Watermark',
            crop_desc: 'Batch crop watermark from images and convert format',
            crop_page_desc: 'Batch crop watermarks and export images',

            // 上传相关
            upload_text: 'Click or drag image here to upload',
            upload_hint: 'Supports: JPG, PNG, GIF, WEBP (Max 10MB)',
            bg_upload_text: 'Click or drag image here',
            bg_upload_hint: 'Supports: JPG, PNG, GIF, WEBP',
            preview_label: 'Image Preview',

            // ICO 设置
            select_size: 'Select Icon Size (multiple allowed)',
            rounded_title: 'Rounded Corners',
            rounded_hint: 'Apply rounded corners to icons',
            generate_btn: 'Generate ICO',
            generated_icons: 'Generated Icons',
            ico_tip: '💡 Tip: 64×64 is recommended for most desktop icons. Click individual icons to download separately, or use "Download All" to get all sizes in a ZIP file.',

            // 去背景设置
            bg_original: 'Original',
            bg_result: 'Result (transparent)',
            tolerance_label: 'Tolerance - Adjust to control background removal range',
            process_btn: 'Remove Background',
            download_btn: 'Download PNG',
            bg_tip: '💡 Tip: Lower tolerance = precise removal, Higher tolerance = more aggressive removal',

            // 帮助页面
            help_title: 'Help & FAQ',
            help_subtitle: 'Learn how to use our tools',
            help1_title: 'Image to ICO Converter',
            help1_desc: 'Upload any PNG, JPG, GIF, or WEBP image. Select your desired icon sizes (multiple sizes can be selected). Enable rounded corners if needed. Click Generate to create ICO files that can be downloaded individually.',
            help2_title: 'Remove Background',
            help2_desc: 'Upload an image with a solid background (white or light color). Adjust the tolerance slider to control how strictly the background is removed. Click Remove Background to process and download the result.',
            help3_title: 'Supported Formats',
            help3_desc: 'All tools support: PNG, JPG, GIF, and WEBP images. Maximum file size is 10MB. All processing is done locally in your browser - your images are never uploaded to any server.',
            help4_title: 'Privacy & Security',
            help4_desc: 'All image processing happens in your browser. Your images are never uploaded to any server. Close the browser to clear all data.',

            // 评分页面
            rating_title: 'Rate Our Service',
            rating_subtitle: 'Your feedback helps us improve',
            rating_prompt: 'Click stars to rate',
            rating_placeholder: 'Share your thoughts (optional)...',
            submit_rating: 'Submit Rating',
            rating_history: 'Rating History',
            you_rated: 'You rated',
            footer_text: 'All tools run locally in your browser',

            // 消息提示
            no_image: 'Please upload an image first',
            no_size: 'Please select at least one size',
            generated: 'icons generated',
            download_success: 'Download successful!',
            download_all_btn: 'Download All (ZIP)',
            no_icons: 'Please generate icons first',

            // 占位符
            upload_placeholder: 'Upload an image to see preview',
            generated_placeholder: 'Generated icons will appear here',
            original_preview: 'Original Preview',
            result_preview: 'Result Preview',

            // 裁剪工具
            crop_upload_text: 'Click or drag images here (batch)',
            crop_upload_hint: 'Supports: JPG, PNG, GIF, WEBP (multiple files)',
            crop_preset_label: 'Preset Mode',
            crop_custom: 'Custom',
            crop_crop_bottom: 'Crop Bottom (px)',
            crop_crop_right: 'Crop Right (px)',
            crop_ratio_label: 'Output Ratio',
            crop_format_label: 'Export Format',
            crop_quality_label: 'Output Quality',
            crop_process_btn: 'Batch Crop',
            crop_download_btn: 'Download All (ZIP)',
            crop_progress: 'Progress',
            crop_file_list: 'File List',
            crop_no_images: 'Please upload images first',
            crop_done: 'images processed',
            crop_clear_btn: 'Clear All',
            crop_template_hint: '💡 Set crop parameters, it will be applied to all images.',
            crop_result_preview: 'Crop Preview',
            crop_preset_doubao: 'Doubao',
            crop_preset_custom: 'Custom'
        },
        zh: {
            // 导航
            nav_tools: '工具',
            nav_help: '帮助',
            nav_rating: '评分',

            // 首页
            home_title: '免费在线图片工具',
            home_subtitle: '点击工具开始处理您的图片',

            // ICO 工具
            ico_name: '图片转 ICO',
            ico_desc: '将图片转换为 ICO 图标格式，支持多种尺寸',
            ico_page_desc: '将您的图片转换为 ICO 图标格式',

            // 去背景工具
            bg_name: '去背景',
            bg_desc: '一键将图片背景变为透明',
            bg_page_desc: '将您的图片背景变为透明',

            // 即将推出的工具
            tool3_name: '图片压缩',
            tool3_desc: '在不损失质量的情况下减小图片大小',
            tool4_name: '格式转换',
            tool4_desc: '在 PNG、JPG、WEBP 格式之间转换',

            // 裁剪去水印工具
            crop_name: '裁剪去水印',
            crop_desc: '批量裁剪图片水印并转换格式',
            crop_page_desc: '批量裁剪水印并导出图片',

            // 上传相关
            upload_text: '点击或拖拽图片到这里上传',
            upload_hint: '支持：JPG、PNG、GIF、WEBP（最大 10MB）',
            bg_upload_text: '点击或拖拽图片到这里',
            bg_upload_hint: '支持：JPG、PNG、GIF、WEBP',
            preview_label: '图片预览',

            // ICO 设置
            select_size: '选择图标尺寸（可多选）',
            rounded_title: '圆角图标',
            rounded_hint: '为图标应用圆角效果',
            generate_btn: '生成 ICO',
            generated_icons: '已生成的图标',
            ico_tip: '💡 提示：64×64 适合大多数桌面图标。点击图标可单独下载，或使用下载全部获取所有尺寸的 ZIP 文件。',

            // 去背景设置
            bg_original: '原图',
            bg_result: '结果（透明）',
            tolerance_label: '容差 - 调整以控制背景去除范围',
            process_btn: '去除背景',
            download_btn: '下载 PNG',
            bg_tip: '💡 提示：容差越低越精确，容差越高去除范围越大',

            // 帮助页面
            help_title: '帮助与常见问题',
            help_subtitle: '了解如何使用我们的工具',
            help1_title: '图片转 ICO 转换器',
            help1_desc: '上传任何 PNG、JPG、GIF 或 WEBP 图片。选择您需要的图标尺寸（可多选）。如需要可启用圆角效果。点击生成按钮创建 ICO 文件，可单独下载。',
            help2_title: '去除背景',
            help2_desc: '上传带有纯色背景（白色或浅色）的图片。调整容差滑块来控制背景去除的严格程度。点击去除背景按钮处理并下载结果。',
            help3_title: '支持的格式',
            help3_desc: '所有工具支持：PNG、JPG、GIF 和 WEBP 图片。最大文件大小为 10MB。所有处理均在浏览器本地完成 - 您的图片绝不会上传到任何服务器。',
            help4_title: '隐私与安全',
            help4_desc: '所有图片处理都在您的浏览器中完成。您的图片绝不会上传到任何服务器。关闭浏览器即可清除所有数据。',

            // 评分页面
            rating_title: '评价我们的服务',
            rating_subtitle: '您的反馈帮助我们改进',
            rating_prompt: '点击星星评分',
            rating_placeholder: '分享您的想法（可选）...',
            submit_rating: '提交评价',
            rating_history: '评价历史',
            you_rated: '您给出了',
            footer_text: '所有工具在浏览器本地运行',

            // 消息提示
            no_image: '请先上传图片',
            no_size: '请至少选择一个尺寸',
            generated: '个图标已生成',
            download_success: '下载成功！',
            download_all_btn: '下载全部 (ZIP)',
            no_icons: '请先生成图标',

            // 占位符
            upload_placeholder: '上传图片以查看预览',
            generated_placeholder: '生成的图标将显示在这里',
            original_preview: '原图预览',
            result_preview: '结果预览',

            // 裁剪工具
            crop_upload_text: '点击或拖拽图片到这里（支持批量）',
            crop_upload_hint: '支持：JPG、PNG、GIF、WEBP（多文件）',
            crop_preset_label: '预设模式',
            crop_custom: '自定义',
            crop_crop_bottom: '向上裁剪（像素）',
            crop_crop_right: '向左裁剪（像素）',
            crop_ratio_label: '输出比例',
            crop_format_label: '导出格式',
            crop_quality_label: '输出质量',
            crop_process_btn: '批量裁剪',
            crop_download_btn: '下载全部 (ZIP)',
            crop_progress: '进度',
            crop_file_list: '文件列表',
            crop_no_images: '请先上传图片',
            crop_done: '张图片已处理',
            crop_clear_btn: '清空全部',
            crop_template_hint: '💡 设置裁剪参数，将应用到所有图片。',
            crop_result_preview: '裁剪预览',
            crop_preset_doubao: '豆包去水印',
            crop_preset_custom: '自定义'
        }
    },

    // 获取当前语言的翻译
    t(key) {
        return this.translations[this.currentLang][key] || key;
    },

    // 设置语言
    setLang(lang) {
        this.currentLang = lang;
        localStorage.setItem('hctools_lang', lang);
    },

    // 更新页面上的所有翻译文本
    updatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (this.translations[this.currentLang][key]) {
                el.textContent = this.translations[this.currentLang][key];
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            if (this.translations[this.currentLang][key]) {
                el.placeholder = this.translations[this.currentLang][key];
            }
        });
    }
};

// 导出 i18n
window.I18n = I18n;
