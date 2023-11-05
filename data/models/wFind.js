import { workerData, parentPort } from 'worker_threads';

// export default ({ city, state, records, idxStart, idxEnd }) => {
// 	for (let i = idxStart; i < idxEnd; i++) {
export default ({ city, state, records }) => {
	for (let i = 0; i < records.length; i++) {
		const rowStr = records[i].toLowerCase();
		if (rowStr.slice(0, 2) === city.slice(0, 2)) {
			const rowArr = rowStr.split(',');
			if (rowArr[0] === city) {
				if (rowArr[1] === state) {
					return i;
				}
			}
		}
	}
	return null;
};

// const found = findRecord(workerData.city, workerData.state, workerData.records);

// parentPort?.postMessage(found);
