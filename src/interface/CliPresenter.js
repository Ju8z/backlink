"use strict";

import { TerminalLinkFormatter } from "../domain/utils/TerminalLinkFormatter.js";
import { Colorz } from "./Colorz.js";

export class CliPresenter {
	
	#terminalLinkFormatter;
	
	constructor() {
		this.#terminalLinkFormatter = new TerminalLinkFormatter();
	}
	
	printBacklinkProgress({
							  completedCount,
							  totalCount,
							  domain,
							  statusCode,
							  url,
						  }) {
		console.log(
			`[${ completedCount }/${ totalCount }] `
			+ `${ this.#colorize(domain, Colorz.LIGHT_BLUE) } > Response: `
			+ `${ this.#formatStatus(statusCode) } > Backlink: `
			+ `${ this.#terminalLinkFormatter.formatConsoleLink({ url }) }`,
		);
	}
	
	printBacklinkSummary({
							 completedCount,
							 failedCount,
							 completedFilePath,
							 failedFilePath,
						 }) {
		console.log(
			`Saved ${ this.#colorize(String(completedCount), Colorz.GREEN) } completed backlinks to `
			+ `${ this.#terminalLinkFormatter.formatFileLink({ filePath: completedFilePath }) }`,
		);
		console.log(
			`Saved ${ this.#colorize(String(failedCount), Colorz.RED) } failed backlinks to `
			+ `${ this.#terminalLinkFormatter.formatFileLink({ filePath: failedFilePath }) }`,
		);
	}
	
	#formatStatus(statusCode) {
		const color = statusCode === 200 ? Colorz.GREEN : Colorz.RED;
		return this.#colorize(String(statusCode), color);
	}
	
	#colorize(text, color) {
		return `${ color }${ text }${ Colorz.RESET }`;
	}
}
