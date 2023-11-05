import fs from 'fs';
import { copyFile, writeFile } from 'fs/promises';
import { readFile, appendFile } from 'node:fs/promises';
import { Worker } from 'worker_threads';
import Piscina from 'piscina';
import { resolve } from 'path';

const wFindPath = './data/models/wFind.js';
const wUpdatePath = './data/models/wUpdate.js';
export class CityPopulation {
	constructor(workingFilePathUri, tempFilePathUri) {
		this.workFilePath = workingFilePathUri;
		this.tempFilePath = tempFilePathUri;
		this.records = this.initData() ?? [];
		this.cache = [];
		this.cacheMax = 64;
		this.writeQueue = 0;
		this.lastWrite = Date.now();
		this.threadPool = new Piscina();
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
	// async loadData() {
	// 	try {
	// 		this.records = (
	// 			await readFile(this.workFilePath, { encoding: 'utf8' })
	// 		).split('\n');
	// 	} catch (error) {
	// 		console.error('ERR: @ loadData() : ', error.message);
	// 		// pass up Error
	// 		throw error;
	// 	}
	// }
	async indexRecords() {
		// await this.threadPool()
	}

	// returns [population, cacheIndex]
	findCacheRecord(city, state) {
		console.log('findCacheRecord()...');
		for (let i = 0; i < this.cache.length; i++) {
			if (this.cache[i].includes(city + ',' + state + ',')) {
				return [this.cache[i].split(',').at(-1), i];
			}
		}
		return [null, null];
	}
	appendToCache(city, state, population) {
		console.log('appendToCache()...');
		while (this.cache.length >= this.cacheMax) {
			this.cache.pop();
		}

		this.cache.push(city + ',' + state + ',' + population);
	}
	updateCache(city, state, population) {
		console.log('updateCache()...');
		const cacheRecord = this.findCacheRecord(city, state);
		console.log('cacheRecord: ', cacheRecord);
		if (cacheRecord[0] === null) {
			return null;
		}

		const oldRecord = this.cache.splice(
			cacheRecord[1],
			1,
			city + ',' + state + ',' + population,
		);
		if (oldRecord && cacheRecord[0]) {
			console.log('updated CACHE');
			return 200;
		}
		console.log('update FAIL');
		return null;
	}
	// Records Actions
	async findSourceRecord(city, state, indexStart, indexEnd) {
		const foundIndex = await this.threadPool.run(
			{
				city: city,
				state: state,
				records: this.records,
				idxStart: indexStart,
				idxEnd: indexEnd,
			},
			{ filename: wFindPath },
		);
		return this.records[Number(foundIndex)].split(',')[2];
	}

	async putCityRecord(city, state, population) {
		console.log('Put Source Record');
		let recordFound = false;
		let foundIndex = null;
		// const searchRange =
		try {
			foundIndex = await this.threadPool.run(
				{
					city: city,
					state: state,
					records: this.records,
				},
				{ filename: wFindPath },
			);

			// count put
			this.writeQueue = this.writeQueue + 1;
			if (foundIndex) {
				// update Memory Record
				const updatedRecord = this.records.splice(
					foundIndex,
					1,
					city + ',' + state + ',' + population,
				);
				// console.log(foundIndex + ' ' + updatedRecord);
				// check if write is necessary
				if (Date.now() - this.lastWrite < 2000 || this.writeQueue < 1) {
					await this.updateSourceRecords();
				}

				return 200;
			} else {
				// update Memory Record
				// insert @ index
				this.records.push(city + ',' + state + ',' + population);
				// check if write is necessary
				if (Date.now() - this.lastWrite < 2000 || this.writeQueue < 1) {
					await this.updateSourceRecords();
				}
				return 201;
			}
		} catch (error) {
			console.error('ERR: @ putCityRecord() ', error.message);
			// pass up error to origin call
			throw error;
		}
	}

	async updateSourceRecords() {
		try {
			// Block all writes for 2000ms
			this.lastWrite = Date.now();
			await this.threadPool.run(
				{
					workFilePath: this.workFilePath,
					tempFilePath: this.tempFilePath,
					records: this.records,
				},
				{ filename: wUpdatePath },
			);
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
}
