"use strict";

import { writeFile } from "node:fs/promises";

export class TextReportWriter {
	async save({ filePath, lines }) {
		const contents = lines.length > 0 ? `${ lines.join("\n") }\n` : "";
		await writeFile(filePath, contents, "utf8");
	}
}
