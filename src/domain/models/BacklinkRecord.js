"use strict";

import { BacklinkDataError } from "../errors/BacklinkDataError.js";

export class BacklinkRecord {
	
	constructor({ url }) {
		this.url = this.#normalizeUrl(url);
	}
	
	static fromUnknown({ value, index, sourceName }) {
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			throw new BacklinkDataError(
				`Invalid entry at position ${ index } in ${ sourceName }: expected an object.`,
			);
		}
		
		if (!Object.hasOwn(value, "url")) {
			throw new BacklinkDataError(
				`Invalid entry at position ${ index } in ${ sourceName }: missing url string.`,
			);
		}
		
		try {
			return new BacklinkRecord({
				url: value.url,
			});
		} catch (error) {
			throw new BacklinkDataError(
				`Invalid entry at position ${ index } in ${ sourceName }: missing url string.`,
				{ cause: error },
			);
		}
	}
	
	#normalizeUrl(url) {
		if (typeof url !== "string" || url.trim() === "") {
			throw new BacklinkDataError("Backlink url must be a non-empty string.");
		}
		
		return url.trim();
	}
	
	withDomain({ domain, placeholderDomain }) {
		return new BacklinkRecord({
			url: this.url.replace(placeholderDomain, domain),
		});
	}
}
