const ABSOLUTE_PICTURE_URL_PATTERN = /^(?:data:|blob:|https?:|\/\/)/i;

/**
 * 上传接口返回的是与环境无关的相对地址。展示时在这里统一拼接 API 前缀，
 * 避免表单配置绑定某一个部署域名。
 */
export function resolvePictureUrl(value) {
	const source = typeof value === 'string' ? value.trim() : '';
	if (!source || ABSOLUTE_PICTURE_URL_PATTERN.test(source)) {
		return source;
	}

	const apiBase = String(import.meta.env.VITE_APP_BASE_API || '').replace(/\/$/, '');
	const picturePath = source.startsWith('/') ? source : `/${source}`;
	return `${apiBase}${picturePath}`;
}
