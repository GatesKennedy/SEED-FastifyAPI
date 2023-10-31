import { workerData, parentPort } from 'worker_threads';

const findRecord = (city, state, records) => {
	// 'for of' loop faster than Array Methods
	for (const row of records) {
		// skim records with partial 2 char read of each
		if (row.toLowerCase().slice(0, 2) === city.slice(0, 2)) {
			// compare deeper if promising 'skim'
			const rowArray = row.split(',');
			if (rowArray[0].toLowerCase() === city) {
				if (rowArray[1].toLowerCase() === state) {
					return rowArray[2];
				}
			}
		}
	}
	return null;
};

const found = findRecord(workerData.city, workerData.state, workerData.records);

parentPort?.postMessage(found);
