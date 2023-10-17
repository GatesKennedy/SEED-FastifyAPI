import {
	getCityPopulation,
	putCityPopulation,
} from '../controllers/populationController.js';

// Schema
const Item = {
	type: 'object',
	properties: {
		message: { type: 'string' },
		city: { type: 'string' },
		state: { type: 'string' },
		population: { type: 'integer' },
	},
};

// Options
const getCityPopulationOpts = {
	schema: {
		response: {
			200: Item,
		},
	},
	handler: getCityPopulation,
};
const putCityPopulationOpts = {
	schema: {
		response: {
			200: Item,
		},
	},
	handler: putCityPopulation,
};

//	Routes
async function populationRoutes(fastify, options) {
	fastify.get('/state/:state/city/:city', getCityPopulationOpts);
	fastify.put('/state/:state/city/:city', putCityPopulationOpts);
}

export default populationRoutes;
