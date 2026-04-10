"use strict";

import { basename } from "node:path";
import { readFile } from "node:fs/promises";

import { BacklinkDataError } from "../errors/BacklinkDataError.js";
import { BacklinkRecord } from "../models/BacklinkRecord.js";

export class JSONBackLinkConverter {
	
	async load({ filePath }) {
		let rawPayload;
		
		try {
			rawPayload = await readFile(filePath, "utf8");
		} catch (error) {
			throw new BacklinkDataError(`Missing source file: ${ basename(filePath) }`, {
				cause: error,
			});
		}
		
		let payload;
		
		try {
			payload = JSON.parse(rawPayload);
		} catch (error) {
			throw new BacklinkDataError(
				`Invalid JSON in ${ basename(filePath) }: ${ error.message }`,
				{
					cause: error,
				},
			);
		}
		
		if (!Array.isArray(payload)) {
			throw new BacklinkDataError(
				`${ basename(filePath) } must contain a JSON array of backlink objects.`,
			);
		}
		
		return payload.map((value, index) => BacklinkRecord.fromUnknown({
			value,
			index: index + 1,
			sourceName: basename(filePath),
		}));
	}
}
