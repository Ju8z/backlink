"use strict";

export class RunBacklinkCheckUseCase {
	
	#backlinkRepository;
	#reportWriter;
	#timeoutMilliseconds;
	#concurrentWorkflowService;
	#cliPresenter;
	#sourceFilePath;
	#completedFilePath;
	#failedFilePath;
	#placeholderDomain;
	
	constructor({
					backlinkRepository,
					reportWriter,
					timeoutMilliseconds,
					concurrentWorkflowService,
					cliPresenter,
					sourceFilePath,
					completedFilePath,
					failedFilePath,
					placeholderDomain,
				}) {
		this.#backlinkRepository = backlinkRepository;
		this.#reportWriter = reportWriter;
		this.#timeoutMilliseconds = this.#validateTimeout(timeoutMilliseconds);
		this.#concurrentWorkflowService = concurrentWorkflowService;
		this.#cliPresenter = cliPresenter;
		this.#sourceFilePath = sourceFilePath;
		this.#completedFilePath = completedFilePath;
		this.#failedFilePath = failedFilePath;
		this.#placeholderDomain = placeholderDomain;
	}
	
	async execute({ domain, workers }) {
		const backlinks = await this.#backlinkRepository.load({
			filePath: this.#sourceFilePath,
		});
		
		const results = await this.#concurrentWorkflowService.run({
			items: backlinks,
			workers,
			handleItem: async({ item, index }) => {
				const resolvedBacklink = item.withDomain({
					domain,
					placeholderDomain: this.#placeholderDomain,
				});
				const statusCode = await this.#fetchStatus({
					url: resolvedBacklink.url,
				});
				
				return {
					index,
					resolvedBacklink,
					statusCode,
				};
			},
			onItemCompleted: async({ result, completedCount, totalCount }) => {
				this.#cliPresenter.printBacklinkProgress({
					completedCount,
					totalCount,
					domain,
					statusCode: result.statusCode,
					url: result.resolvedBacklink.url,
				});
			},
		});
		
		const completedBacklinks = results
		.filter((result) => result.statusCode === 200)
		.map((result) => result.resolvedBacklink);
		const failedUrls = results
		.filter((result) => result.statusCode !== 200)
		.map((result) => result.resolvedBacklink.url);
		const completedUrls = completedBacklinks.map((backlink) => backlink.url);
		
		await this.#reportWriter.save({
			filePath: this.#completedFilePath,
			lines: completedUrls,
		});
		await this.#reportWriter.save({
			filePath: this.#failedFilePath,
			lines: failedUrls,
		});
		
		this.#cliPresenter.printBacklinkSummary({
			completedCount: completedUrls.length,
			failedCount: failedUrls.length,
			completedFilePath: this.#completedFilePath,
			failedFilePath: this.#failedFilePath,
		});
	}
	
	async #fetchStatus({ url }) {
		try {
			const response = await fetch(url, {
				signal: AbortSignal.timeout(this.#timeoutMilliseconds),
			});
			
			return response.status;
		} catch {
			return "timeout";
		}
	}
	
	#validateTimeout(timeoutMilliseconds) {
		if (!Number.isInteger(timeoutMilliseconds) || timeoutMilliseconds < 1) {
			throw new Error("RunBacklinkCheckUseCase timeout must be a positive integer.");
		}
		
		return timeoutMilliseconds;
	}
}
