import { CityPopulation } from '../../data/models/cityPopulationModel.js';

const dataPath = './data/city_populations.csv';
const cityData = new CityPopulation(dataPath);

if (cityData.records && cityData.records.length < 1) {
	console.log('dataLoaded @ ', Date.now());
	cityData.loadData();
}

// Route Actions
// GET cityData
export const getCityPopulation = (req, reply) => {
	try {
		const state = String(req.params.state).toLowerCase();
		const city = String(req.params.city).toLowerCase();

		const population = cityData.findCityRecord(city, state);
		if (Number.isNaN(population) || population === null) {
			throw new Error(`Error: '${city}', '${state}' not found.`);
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
		const population = req.body.population;

		await cityData.putCityRecord(city, state, population);

		return reply.send({
			state: state,
			city: city,
			population: population,
		});
	} catch (err) {
		console.error('ERR: @ putCityPopulation Route - ', err.message);
		return reply.status(400).send({ message: err.message });
	}
};
