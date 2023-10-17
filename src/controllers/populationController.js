import fs from 'fs';

let cityData = [];
const dataPath = './data/city_populations.csv';

// FS Actions
async function loadData(filePath) {
	fs.readFile(filePath, 'utf-8', (err, data) => {
		if (err) console.log(err);
		else {
			cityData = data.split('\n');
		}
	});
}
async function writeData(filePath, updatedRecords) {
	fs.writeFile(filePath, updatedRecords, 'utf-8', (err) => {
		if (err) console.log(err);
		else {
			loadData(dataPath);
		}
	});
}
if (cityData.length < 1) {
	console.log('time: ', Date.now());
	await loadData(dataPath);
}

// Record Actions
function findCityRecord(data, city, state) {
	for (const row of data) {
		// Skim records
		if (row.toLowerCase().slice(0, 2) === city.toLowerCase().slice(0, 2)) {
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

async function putCityRecord(data, city, state, population) {
	const updatedRecords = [];
	let recordFound = false;
	for (const row of data) {
		// skim records
		if (row.toLowerCase().slice(0, 2) === city.toLowerCase().slice(0, 2)) {
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
		await writeData(dataPath, updatedRecords.join('\n'));
	} else {
		throw new Error('No Record Found. Creating records is not allowed.');
	}
}

// Route Actions
export const getCityPopulation = async (req, reply) => {
	try {
		const state = String(req.params.state).toLowerCase();
		const city = String(req.params.city).toLowerCase();

		const population = findCityRecord(cityData, city, state);
		if (Number.isNaN(population) || population === null) {
			throw new Error(`ERROR: '${city}', '${state}' Not Found!`);
		}

		return reply.send({
			city: city,
			state: state,
			population: population,
		});
	} catch (err) {
		return reply.status(400).send({ message: err.message });
	}
};

export const putCityPopulation = async (req, reply) => {
	try {
		const state = String(req.params.state).toLowerCase();
		const city = String(req.params.city).toLowerCase();
		const population = req.body.population;

		await putCityRecord(cityData, city, state, population);

		return reply.send({
			state: state,
			city: city,
			population: population,
		});
	} catch (err) {
		return reply.status(400).send({ message: err.message });
	}
};
