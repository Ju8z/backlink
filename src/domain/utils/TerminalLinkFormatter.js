"use strict";

import { basename } from "node:path";
import { pathToFileURL } from "node:url";

export class TerminalLinkFormatter {
	
	constructor() {
	}
	
	formatConsoleLink({ url, label }) {
		const targetUrl = this.#normalizeConsoleTargetUrl(url);
		const resolvedLabel = this.#resolveConsoleLabel({ url, label, targetUrl });
		
		return `\u001B]8;;${ targetUrl }\u001B\\${ resolvedLabel }\u001B]8;;\u001B\\`;
	}
	
	formatFileLink({ filePath }) {
		return this.formatConsoleLink({
			url: pathToFileURL(filePath).href,
			label: basename(filePath),
		});
	}
	
	#hasExplicitScheme(url) {
		return /^[a-zA-Z][a-zA-Z\d+\-.]*:/u.test(url);
	}
	
	#tryNormalizeUrl(url) {
		try {
			return new URL(url).href;
		} catch {
			return encodeURI(url);
		}
	}
	
	#normalizeConsoleTargetUrl(url) {
		const trimmedUrl = url.trim();
		const targetUrl = this.#hasExplicitScheme(trimmedUrl)
			? trimmedUrl
			: `https://${ trimmedUrl }`;
		
		return this.#tryNormalizeUrl(targetUrl);
	}
	
	#formatAutoDetectFriendlyUrl(url) {
		return url
		.replaceAll("*", "%2A")
		.replaceAll("$", "%24");
	}
	
	#resolveConsoleLabel({ url, label, targetUrl }) {
		if (label == null) {
			return this.#formatAutoDetectFriendlyUrl(targetUrl);
		}
		
		if (label !== url) {
			return label;
		}
		
		return this.#formatAutoDetectFriendlyUrl(targetUrl);
	}
}
