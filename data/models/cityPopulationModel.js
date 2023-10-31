import fs from 'fs';
import { copyFile, writeFile } from 'fs/promises';
import { readFile, appendFile } from 'node:fs/promises';
import { Worker } from 'worker_threads';
export class CityPopulation {
	constructor(workingFilePathUri, tempFilePathUri) {
		this.workFilePath = workingFilePathUri;
		this.tempFilePath = tempFilePathUri;
		this.records = this.initData() ?? [];
		this.cache = [];
		this.cacheMax = 64;
		this.writeQueue = 0;
		this.lastWrite = Date.now();
	}

	//	File System Actions
	// Blocking I/O for inital data load
	initData() {
		try {
			return fs
				.readFileSync(this.workFilePath, { encoding: 'utf-8' })
				.split('\n');
		} catch (error) {
			console.error('ERR: @ initData() - ', error.name);
			console.error(error.message);
			return [];
		}
	}

	async loadData() {
		try {
			this.records = (
				await readFile(this.workFilePath, { encoding: 'utf8' })
			).split('\n');
		} catch (error) {
			console.error('ERR: @ loadData() : ', error.message);
			// pass up Error
			throw error;
		}
	}

	async updateRecords() {
		// check if write is necessary
		if (Date.now() - this.lastWrite < 2000 || this.writeQueue < 1) {
			return;
		}

		try {
			// Block all writes for 2000ms
			this.lastWrite = Date.now();
			// write to temp (async OS proc)
			await writeFile(this.tempFilePath, this.records.join('\n'));
			// copy temp to working file (async OS proc)
			await copyFile(this.tempFilePath, this.workFilePath);
			this.lastWrite = Date.now();
			this.writeQueue = 0;
		} catch (error) {
			console.error(
				'ERR @ writeData() - Failed to Write Data to ' +
					this.workFilePath,
			);
			throw error;
		}
	}
	updateCache(city, state, population) {
		const record = city + ',' + state + ',' + population;
		if (this.cache.includes(record)) {
			return;
		}

		while (this.cache.length >= this.cacheMax) {
			this.cache.pop();
		}

		this.cache.push(record);
	}

	findCacheRecord(city, state) {
		for (const record of this.cache) {
			if (record.includes(city + ',' + state + ',')) {
				return record.split(',').at(-1);
			}
		}
		return null;
	}

	// Records Actions
	async findSourceRecord(city, state) {
		return new Promise((resolve, reject) => {
			const records = this.records;
			const worker = new Worker('./data/models/wFinder.js', {
				workerData: {
					city,
					state,
					records,
				},
			});

			worker.once('message', (data) => {
				resolve(data);
			});

			worker.once('error', (err) => {
				reject(err);
			});
		});
	}

	async putCityRecord(city, state, population) {
		let recordFound = false;
		try {
			for (let i = 0; i < this.records.length; i++) {
				const rowStr = this.records[i].toLowerCase();
				if (rowStr.slice(0, 2) === city.slice(0, 2)) {
					const rowArr = rowStr.split(',');
					if (rowArr[0] === city) {
						if (rowArr[1] === state) {
							recordFound = true;
							this.records.push(
								rowArr[0] + ',' + rowArr[1] + ',' + population,
							);
							this.records.splice(i, 1);
							continue;
						}
					}
				}
			}

			// count put
			this.writeQueue = this.writeQueue + 1;
			if (recordFound) {
				await this.updateRecords();
				return 200;
			} else {
				this.records.push(city + ',' + state + ',' + population);
				await this.updateRecords();
				return 201;
			}
		} catch (error) {
			console.error('ERR: @ putCityRecord() ', error.message);
			// pass up error to origin call
			throw error;
		}
	}
}
