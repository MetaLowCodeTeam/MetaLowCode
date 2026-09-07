const UPLOAD_WIDGET_TYPES = new Set(["file-upload", "picture-upload"]);
const PENDING_UPLOAD_STATUSES = new Set(["ready", "uploading"]);

const hasPendingFile = (fileList) => {
    return Array.isArray(fileList)
        && fileList.some((file) => PENDING_UPLOAD_STATUSES.has(file?.status));
};

const getUploadingFiles = (widgetRef) => {
    if (!widgetRef.mlUploadingFiles) {
        widgetRef.mlUploadingFiles = new Map();
    }
    return widgetRef.mlUploadingFiles;
};

const getFileKey = (file) => file?.uid ?? file?.name;

/**
 * 将上传请求体发送完成后的进度保持在 95%，收到接口结果后再隐藏。
 */
export const configureVFormUploadProgress = (visualDesign) => {
    const fieldComponents = visualDesign?.VFormSDK?.FieldComponents;
    if (!fieldComponents) return;

    ["file-upload-widget", "picture-upload-widget"].forEach((componentName) => {
        const component = fieldComponents[componentName];
        const methods = component?.methods;
        if (!methods || component.__mlUploadProgressConfigured) return;

        component.__mlUploadProgressConfigured = true;
        const beforeUploadMethodName = componentName === "file-upload-widget"
            ? "beforeFileUpload"
            : "beforePictureUpload";
        const originalBeforeUpload = methods[beforeUploadMethodName];
        methods[beforeUploadMethodName] = function (file) {
            const result = originalBeforeUpload.call(this, file);
            if (result !== false) {
                getUploadingFiles(this).set(getFileKey(file), file);
            }
            return result;
        };

        methods.handleUploadProgress = function (event) {
            const percentage = Number(event?.percent) || 0;
            this.uploadPercentage = Math.min(Math.floor(percentage), 95);
        };

        const successMethodName = componentName === "file-upload-widget"
            ? "handleFileUpload"
            : "handlePictureUpload";
        const originalSuccess = methods[successMethodName];
        methods[successMethodName] = function (...args) {
            const result = originalSuccess.apply(this, args);
            getUploadingFiles(this).delete(getFileKey(args[1]));
            if (getUploadingFiles(this).size > 0) {
                this.uploadPercentage = 95;
            }
            return result;
        };

        const originalError = methods.handleUploadError;
        methods.handleUploadError = function (...args) {
            const result = originalError.apply(this, args);
            getUploadingFiles(this).delete(getFileKey(args[1]));
            this.uploadPercentage = getUploadingFiles(this).size > 0 ? 95 : 0;
            return result;
        };

        if (componentName === "file-upload-widget") {
            const originalRemove = methods.removeUploadFile;
            methods.removeUploadFile = function (name, url, uid) {
                const uploadingFiles = getUploadingFiles(this);
                const uploadingFile = uploadingFiles.get(uid ?? name);
                if (uploadingFile) {
                    this.$refs.fieldEditor?.handleRemove(uploadingFile);
                    uploadingFiles.delete(getFileKey(uploadingFile));
                    this.uploadPercentage = uploadingFiles.size > 0 ? 95 : 0;
                    return;
                }
                return originalRemove.call(this, name, url, uid);
            };
        } else {
            const originalRemove = methods.handlePictureRemove;
            methods.handlePictureRemove = function (file, fileList) {
                const result = originalRemove.call(this, file, fileList);
                const uploadingFiles = getUploadingFiles(this);
                uploadingFiles.delete(getFileKey(file));
                this.uploadPercentage = uploadingFiles.size > 0 ? 95 : 0;
                return result;
            };
        }
    });
};

/**
 * 检查 VForm（包括子表单行）中是否还有待上传或正在上传的文件。
 */
export const hasVFormUploadingFile = (formRef) => {
    if (!formRef?.getFieldWidgets || !formRef?.getWidgetRef) return false;

    const uploadWidgets = formRef
        .getFieldWidgets(true)
        .filter((widget) => UPLOAD_WIDGET_TYPES.has(widget.type));

    return uploadWidgets.some((widget) => {
        const widgetRefNames = [widget.name];
        if (formRef.findWidgetNameInSubForm) {
            widgetRefNames.push(...formRef.findWidgetNameInSubForm(widget.name));
        }

        return [...new Set(widgetRefNames)].some((refName) => {
            const widgetRef = formRef.getWidgetRef(refName);
            return widgetRef?.mlUploadingFiles?.size > 0
                || hasPendingFile(widgetRef?.fileList);
        });
    });
};
