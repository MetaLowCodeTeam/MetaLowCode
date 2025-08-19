/**
 * 全局代码错误捕捉 错误拦截 异常拦截
 * 比如 null.length 就会被捕捉到
 */

export default (error, vm)=>{
	//过滤HTTP请求错误
	if(error.status || error.status==0){
		return false
	}

	var errorMap = {
		InternalError: "Javascript引擎内部错误",
		ReferenceError: "未找到对象",
		TypeError: "使用了错误的类型或对象",
		RangeError: "使用内置对象时，参数超范围",
		SyntaxError: "语法错误",
		EvalError: "错误的使用了Eval",
		URIError: "URI错误"
	}
    console.warn(`[ML error]: ${error}`);
	console.error(error); 
	console.log(error); 
	var errorName = errorMap[error.name] || "未知错误"
	//throw error;

	vm.$nextTick(() => {
		const overlayTitle = `[${errorName}]`;
		const overlayMessage = (error && (error.stack || error.message)) ? (error.stack || error.message) : String(error);
		try {
			vm.$notify.error({
				title: errorName,
				message: error,
				onClick: () => {
					try { showMlErrorOverlay(overlayTitle, overlayMessage); } catch (e) {}
				}
			});
		} catch (e) {
			// 通知创建失败时的兜底：直接展示覆盖层
			try { showMlErrorOverlay(overlayTitle, overlayMessage); } catch (e2) {}
		}
	})
}

// 简易错误覆盖层（黑色框 + 半透明遮罩），点击关闭
function showMlErrorOverlay(title, message) {
	if (typeof document === 'undefined') return;
	// style
	if (!document.getElementById('ml-error-overlay-style')) {
		const style = document.createElement('style');
		style.id = 'ml-error-overlay-style';
		style.textContent = `
		#ml-error-overlay{position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,.45);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;}
		#ml-error-overlay .ml-error-box{background:#111;color:#eee;max-width:80vw;max-height:70vh;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.6);padding:16px 20px;font-family:Menlo,Consolas,monospace;overflow:auto;white-space:pre-wrap;word-break:break-word;border:1px solid #333;}
		#ml-error-overlay .ml-error-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-weight:600;color:#ff6b6b;}
		#ml-error-overlay .ml-error-title{font-size:14px;}
		#ml-error-overlay .ml-error-close{cursor:pointer;color:#bbb;padding:2px 8px;border:1px solid #444;border-radius:4px;font-size:12px;}
		#ml-error-overlay .ml-error-close:hover{color:#fff;border-color:#888;}
		`;
		document.head.appendChild(style);
	}
	// overlay
	let overlay = document.getElementById('ml-error-overlay');
	if (!overlay) {
		overlay = document.createElement('div');
		overlay.id = 'ml-error-overlay';
		document.body.appendChild(overlay);
	}
	// content
	overlay.innerHTML = '';
	const box = document.createElement('div');
	box.className = 'ml-error-box';
	const header = document.createElement('div');
	header.className = 'ml-error-header';
	const titleEl = document.createElement('div');
	titleEl.className = 'ml-error-title';
	titleEl.textContent = title;
	const closeBtn = document.createElement('div');
	closeBtn.className = 'ml-error-close';
	closeBtn.textContent = '关闭';
	closeBtn.onclick = () => {
		if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
	};
	header.appendChild(titleEl);
	header.appendChild(closeBtn);
	const pre = document.createElement('pre');
	pre.textContent = message;
	box.appendChild(header);
	box.appendChild(pre);
	overlay.appendChild(box);
	// 点击遮罩关闭
	overlay.onclick = (e) => {
		if (e.target === overlay) {
			if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
		}
	};
}
