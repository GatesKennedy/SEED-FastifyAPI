import { CityPopulation } from '../../data/models/cityPopulationModel.js';

const dataPath = './data/records_working.csv';
const holdingPath = './data/records_temp.csv';
const cityData = new CityPopulation(dataPath, holdingPath);

// if (cityData.records && cityData.records.length < 1) {
// 	console.log('dataLoaded @ ', Date.now());
// 	cityData.loadData();
// }

// Route Actions
// GET cityData
export const getCityPopulation = async (req, reply) => {
	try {
		const state = String(req.params.state).toLowerCase();
		const city = String(req.params.city).toLowerCase();

		let population = cityData.findCacheRecord(city, state)[0];

		if (!population) {
			population = await cityData.findSourceRecord(city, state);
			cityData.appendToCache(city, state, population);
		}

		if (population === null) {
			throw new Error(
				"Error: '" + city + "', '" + state + "' not found.",
			);
		}

		return reply.send({
			city: city,
			state: state,
			population: population,
		});
	} catch (err) {
		console.error('ERR: @ getCityPopulation Route - ', err.message);
		return reply.status(400).send({ message: err.message });
	}
};

// PUT cityData
export const putCityPopulation = async (req, reply) => {
	try {
		const state = String(req.params.state).toLowerCase();
		const city = String(req.params.city).toLowerCase();
		const population = req.body.toString().trim();

		if (isNaN(population)) {
			throw new Error('Error: Population value is not a number.');
		}

		let statusType = cityData.updateCache(city, state, population);
		console.log('statusType: ', statusType);
		if (statusType === 200) {
			console.log('Put Cache Record');
			return reply.status(statusType).send({
				state: state,
				city: city,
				population: population,
			});
		}

		statusType = await cityData.putCityRecord(city, state, population);

		return reply.status(statusType).send({
			state: state,
			city: city,
			population: population,
		});
	} catch (err) {
		console.error('ERR: @ putCityPopulation Route - ', err.message);

		return reply.status(400).send({ message: err.message });
	}
};
