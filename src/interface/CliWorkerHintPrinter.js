"use strict";

export class CliWorkerHintPrinter {
	
	static printWorkerHint() {
		const workerHintText = [
			"",
			"Use --workers <number> to define how many workers run concurrently. (Default: 20, Minimum: 1)",
			" Example: node backlink.js gelbeseiten.de --workers 10",
			"",
		].join("\n");
		
		console.log(workerHintText);
	}
}
