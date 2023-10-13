import fs from 'fs';
import csvParser from 'csv-parser';

let cityData = [];

let cityDataStream = fs.createReadStream('./data/city_sample.csv', {
	encoding: 'utf-8',
});

function loadData() {
	cityDataStream
		.on('data', (data) => {
			console.log('\nRead data:\n', data.toString().split('\n'));
			cityData = data.toString().split('\n');
		})
		.on('end', () => {
			console.log('No more data.');
		});
}

if (cityData.length < 1) {
	console.log('time: ', Date.now());
	loadData();
}

function writeData() {}

function findCityRecord(data, city, state) {
	for (let i = 0; i < data.length; i++) {
		if (data[i].toLowerCase().slice(0, 2) === city.slice(0, 2)) {
			const row = data[i].split(',');
			if (row[0].toLowerCase() === city.toLowerCase()) {
				if (row[1].toLowerCase() === state.toLowerCase()) {
					return row[2];
				}
			}
		}
	}
}

export const getCityPopulation = async (req, reply) => {
	try {
		const state = String(req.params.state).toLowerCase();
		const city = String(req.params.city).toLowerCase();
		const population = findCityRecord(cityData, city, state);

		if (Number.isNaN(population)) {
			throw new Error('City Not Found');
		}
		reply.send(`${state}-${city} = ${population}`).data({
			state: state,
			city: city,
			population: population,
		});
	} catch (err) {
		console.log(err.message);
		reply.status(400).send(err);
	}
};

export const putCityPopulation = async (req, reply) => {
	try {
		const state = String(req.params.state).toLowerCase();
		const city = String(req.params.city).toLowerCase();

		reply.send(`${state}-${city} Not implemented yet`).data({
			state: state,
			city: city,
			population: 0,
		});
	} catch (err) {
		reply.status(400).send(err);
	}
};
