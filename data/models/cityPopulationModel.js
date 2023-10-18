import fs from 'fs';
import { readFile } from 'node:fs/promises';
export class CityPopulation {
	constructor(filePathUri) {
		this.filePath = filePathUri;
		this.records = this.initData() ?? [];
	}

	//	File System Actions
	// Blocking I/O for inital data load
	initData() {
		try {
			return fs
				.readFileSync(this.filePath, { encoding: 'utf-8' })
				.split('\n');
		} catch (error) {
			console.error('ERR: @ initData() - ', error.name);
			console.error(error.message);
			return [];
		}
	}
	// Non-blocking Read of data
	async loadData() {
		try {
			this.records = (
				await readFile(this.filePath, { encoding: 'utf8' })
			).split('\n');
		} catch (error) {
			console.error('ERR: @ loadData() : ', error.message);
			// pass up Error
			throw error;
		}
	}
	// Blocking Write method to protect data integrity
	// Non-blocking Read Method for concurrency
	writeData(updatedRecords) {
		try {
			fs.writeFileSync(this.filePath, updatedRecords);
			this.loadData();
		} catch (error) {
			console.error(
				`ERR @ writeData() - Failed to Write Data to ${this.filePath}`,
			);
			// pass up Error
			throw error;
		}
	}

	// Record Actions
	findCityRecord(city, state) {
		// 'for of' loop faster than Array Methods
		for (const row of this.records) {
			// skim records with partial 2 char read of each
			if (
				row.toLowerCase().slice(0, 2) === city.toLowerCase().slice(0, 2)
			) {
				// compare deeper if promising 'skim'
				const rowArray = row.split(',');
				if (rowArray[0].toLowerCase() === city.toLowerCase()) {
					if (rowArray[1].toLowerCase() === state.toLowerCase()) {
						return rowArray[2];
					}
				}
			}
		}
		return null;
	}

	async putCityRecord(city, state, population) {
		const updatedRecords = [];
		let recordFound = false;
		try {
			// 'for of' loop faster than Array Methods
			for (const row of this.records) {
				// skim records with partial 2 char read of each
				if (
					row.toLowerCase().slice(0, 2) ===
					city.toLowerCase().slice(0, 2)
				) {
					// compare deeper if promising 'skim'
					const rowArray = row.split(',');
					if (rowArray[0].toLowerCase() === city.toLowerCase()) {
						if (rowArray[1].toLowerCase() === state.toLowerCase()) {
							recordFound = true;
							updatedRecords.push(
								`${rowArray[0]},${rowArray[1]},${population}`,
							);
							continue;
						}
					}
				}
				updatedRecords.push(row);
			}
			// write file update
			if (recordFound) {
				this.writeData(updatedRecords.join('\n'));
			} else {
				throw new Error(
					'No Record Found. Creating records is not allowed.',
				);
			}
		} catch (error) {
			console.error('ERR: @ putCityRecord() ', error.message);
			// pass up error to origin call
			throw error;
		}
	}
}
