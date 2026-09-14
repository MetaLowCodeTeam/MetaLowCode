const ALLOWED_HTML_TAGS = new Set([
	"A", "B", "BLOCKQUOTE", "BR", "CODE", "DIV", "EM", "HR", "I", "LI",
	"OL", "P", "PRE", "S", "SPAN", "STRONG", "SUB", "SUP", "TABLE",
	"TBODY", "TD", "TFOOT", "TH", "THEAD", "TR", "U", "UL",
]);
const BLOCKED_HTML_TAGS = new Set([
	"BUTTON", "EMBED", "FORM", "IFRAME", "INPUT", "LINK", "MATH", "META",
	"OBJECT", "SCRIPT", "STYLE", "SVG", "TEXTAREA",
]);
const ALLOWED_STYLE_PROPERTIES = new Set([
	"background-color", "border", "border-collapse", "border-color", "border-style",
	"border-width", "color", "font-size", "font-style", "font-weight", "height",
	"line-height", "margin", "margin-bottom", "margin-left", "margin-right",
	"margin-top", "padding", "padding-bottom", "padding-left", "padding-right",
	"padding-top", "text-align", "text-decoration", "vertical-align", "white-space",
	"width",
]);

const escapeHtml = (value) => String(value)
	.replace(/&/g, "&amp;")
	.replace(/</g, "&lt;")
	.replace(/>/g, "&gt;")
	.replace(/"/g, "&quot;")
	.replace(/'/g, "&#039;");

const sanitizeStyle = (styleText = "") => styleText.split(";").map((item) => {
	const separatorIndex = item.indexOf(":");
	if (separatorIndex < 1) return "";
	const property = item.slice(0, separatorIndex).trim().toLowerCase();
	const value = item.slice(separatorIndex + 1).trim();
	if (!ALLOWED_STYLE_PROPERTIES.has(property) || !value) return "";
	if (/(?:expression|javascript:|url\s*\(|@import|behavior|-moz-binding)/i.test(value)) return "";
	return `${property}: ${value}`;
}).filter(Boolean).join("; ");

const isSafeUrl = (url = "") => {
	const value = url.trim();
	if (!value) return false;
	if (value.startsWith("#") || value.startsWith("/") || value.startsWith("./") || value.startsWith("../")) {
		return true;
	}
	return /^(?:https?:|mailto:|tel:)/i.test(value);
};

export const sanitizeReportHtml = (html) => {
	if (typeof DOMParser === "undefined") {
		return escapeHtml(html ?? "");
	}
	const documentNode = new DOMParser().parseFromString(`<div>${String(html ?? "")}</div>`, "text/html");
	const root = documentNode.body.firstElementChild;
	if (!root) return "";

	const sanitizeNode = (node) => {
		Array.from(node.childNodes).forEach((child) => {
			if (child.nodeType === 8) {
				child.remove();
				return;
			}
			if (child.nodeType !== 1) return;
			const tagName = child.tagName.toUpperCase();
			if (BLOCKED_HTML_TAGS.has(tagName)) {
				child.remove();
				return;
			}
			sanitizeNode(child);
			if (!ALLOWED_HTML_TAGS.has(tagName)) {
				child.replaceWith(...Array.from(child.childNodes));
				return;
			}

			Array.from(child.attributes).forEach((attribute) => {
				const attributeName = attribute.name.toLowerCase();
				const keepAttribute = attributeName === "title"
					|| attributeName === "style"
					|| (tagName === "A" && ["href", "target", "rel"].includes(attributeName))
					|| (["TD", "TH"].includes(tagName) && ["colspan", "rowspan"].includes(attributeName));
				if (!keepAttribute) {
					child.removeAttribute(attribute.name);
				}
			});

			if (child.hasAttribute("style")) {
				const safeStyle = sanitizeStyle(child.getAttribute("style"));
				if (safeStyle) {
					child.setAttribute("style", safeStyle);
				} else {
					child.removeAttribute("style");
				}
			}
			if (tagName === "A") {
				const href = child.getAttribute("href") || "";
				if (!isSafeUrl(href)) {
					child.removeAttribute("href");
				}
				if (child.getAttribute("target") === "_blank") {
					child.setAttribute("rel", "noopener noreferrer");
				} else {
					child.removeAttribute("target");
					child.removeAttribute("rel");
				}
			}
		});
	};

	sanitizeNode(root);
	return root.innerHTML;
};
