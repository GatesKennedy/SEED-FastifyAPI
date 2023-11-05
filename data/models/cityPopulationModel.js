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
				console.log(foundIndex + ' ' + updatedRecord);
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
