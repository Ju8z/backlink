"use strict";

export class BacklinkDataError extends Error {
	
	constructor(message, { cause } = {}) {
		super(message, { cause });
		this.name = "BacklinkDataError";
	}
}
