"use strict";

export class ConcurrentWorkflowService {
	
	async run({
				  items,
				  workers,
				  handleItem,
				  onItemCompleted = async() => {
				  },
			  }) {
		const totalCount = items.length;
		const effectiveWorkers = this.#resolveWorkers({
			workers,
			totalCount,
		});
		const results = new Array(totalCount);
		let nextIndex = 0;
		let completedCount = 0;
		
		const consumeQueue = async() => {
			while (nextIndex < totalCount) {
				const currentIndex = nextIndex;
				nextIndex += 1;
				
				const result = await handleItem({
					item: items[currentIndex],
					index: currentIndex,
				});
				
				results[currentIndex] = result;
				completedCount += 1;
				
				await onItemCompleted({
					result,
					completedCount,
					totalCount,
				});
			}
		};
		
		await Promise.all(
			Array.from({ length: effectiveWorkers }, () => consumeQueue()),
		);
		
		return results;
	}
	
	#resolveWorkers({ workers, totalCount }) {
		if (!Number.isInteger(workers) || workers < 1) {
			throw new Error("workers must be a positive integer.");
		}
		
		if (totalCount === 0) {
			return 0;
		}
		
		return Math.min(workers, totalCount);
	}
}
