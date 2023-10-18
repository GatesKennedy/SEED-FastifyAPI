import fs from 'fs';
export class CityPopulation {
	constructor(filePathUri) {
		this.filePath = filePathUri;
		this.encoding = 'utf-8';
		this.records = this.initData();
	}

	//	File System Actions
	initData() {
		try {
			return fs
				.readFileSync(this.filePath, { encoding: 'utf-8' })
				.split('\n');
		} catch (error) {
			console.log(error);
			return [];
		}
	}
	loadData() {
		try {
			this.records = fs
				.readFileSync(this.filePath, { encoding: 'utf-8' })
				.split('\n');
		} catch (error) {
			console.log(error);
		}
	}
	async writeData(updatedRecords) {
		fs.writeFile(this.filePath, updatedRecords, 'utf-8', (err) => {
			if (err) {
				console.log(err);
			} else {
				this.loadData();
			}
		});
	}

	// Record Actions
	findCityRecord(city, state) {
		for (const row of this.records) {
			// Skim records
			if (
				row.toLowerCase().slice(0, 2) === city.toLowerCase().slice(0, 2)
			) {
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
		for (const row of this.records) {
			// skim records
			if (
				row.toLowerCase().slice(0, 2) === city.toLowerCase().slice(0, 2)
			) {
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
			await this.writeData(updatedRecords.join('\n'));
		} else {
			throw new Error(
				'No Record Found. Creating records is not allowed.',
			);
		}
	}
}
