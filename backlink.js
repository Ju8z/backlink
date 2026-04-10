"use strict";

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { RunBacklinkCheckUseCase } from "./src/application/use-cases/RunBacklinkCheckUseCase.js";
import { JSONBackLinkConverter } from "./src/domain/utils/JSONBackLinkConverter.js";
import { TextReportWriter } from "./src/domain/utils/TextReportWriter.js";
import { CliPresenter } from "./src/interface/CliPresenter.js";
import { BannerPrinter } from "./src/interface/BannerPrinter.js";
import { CliWorkerHintPrinter } from "./src/interface/CliWorkerHintPrinter.js";
import { ConcurrentWorkflowService } from "./src/application/services/ConcurrentWorkflowService.js";

const DEFAULT_WORKERS = 20;
const PLACEHOLDER_DOMAIN = "gelbeseiten.de";
const SOURCE_FILE_PATH = "backlinks.json";
const COMPLETED_FILE_PATH = "completed.txt";
const FAILED_FILE_PATH = "failed.txt";
const DELAY_BEFORE_FETCH = 10_000;

function parseWorkerCount(rawValue) {
	const workers = Number.parseInt(rawValue, 10);
	
	if (!Number.isInteger(workers) || workers < 1) {
		throw new Error("workers must be at least 1");
	}
	
	return workers;
}

function parseCommandLine(argv = process.argv.slice(2)) {
	let workers = DEFAULT_WORKERS;
	const positionals = [];
	
	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		
		if (argument === "--") {
			positionals.push(...argv.slice(index + 1));
			break;
		}
		
		if (argument === "--workers") {
			const rawValue = argv[index + 1];
			
			if (rawValue === undefined) {
				throw new Error("Option '--workers' argument is missing.");
			}
			
			workers = parseWorkerCount(rawValue);
			index += 1;
			continue;
		}
		
		if (argument.startsWith("-")) {
			throw new Error(`Unknown option '${argument}'`);
		}
		
		positionals.push(argument);
	}
	
	if (positionals.length > 1) {
		throw new Error("Only one domain can be provided.");
	}
	
	return {
		domain: positionals[0] ?? null,
		workers,
	};
}

async function promptForDomain() {
	const readline = createInterface({
		input: stdin,
		output: stdout,
	});
	
	try {
		const domain = (await readline.question("> Enter your Site\t: ")).trim();
		if (domain === "") {
			throw new Error("A target domain is required.");
		}
		return domain;
	} finally {
		readline.close();
	}
}

async function main() {
	const cliPresenter = new CliPresenter();
	const argumentsDto = parseCommandLine();
	
	BannerPrinter.printBanner();
	CliWorkerHintPrinter.printWorkerHint();
	
	const domain = argumentsDto.domain === null ? await promptForDomain() : argumentsDto.domain.trim();
	
	if (domain === "") {
		throw new Error("A target domain is required.");
	}
	
	const useCase = new RunBacklinkCheckUseCase({
		backlinkRepository: new JSONBackLinkConverter(),
		reportWriter: new TextReportWriter(),
		timeoutMilliseconds: DELAY_BEFORE_FETCH,
		concurrentWorkflowService: new ConcurrentWorkflowService(),
		cliPresenter,
		sourceFilePath: SOURCE_FILE_PATH,
		completedFilePath: COMPLETED_FILE_PATH,
		failedFilePath: FAILED_FILE_PATH,
		placeholderDomain: PLACEHOLDER_DOMAIN,
	});
	
	await useCase.execute({
		domain,
		workers: argumentsDto.workers,
	});
	
	return 0;
}

main().then(
	(exitCode) => {
		process.exitCode = exitCode;
	},
	(error) => {
		const message = error instanceof Error ? error.message : String(error);
		console.error(message);
		process.exitCode = 1;
	},
);
