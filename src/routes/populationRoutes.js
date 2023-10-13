import {
	getCityPopulation,
	putCityPopulation,
} from '../controllers/populationController.js';

const Item = {
	type: 'object',
	properties: {
		population: { type: 'integer' },
	},
};

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

async function populationRoutes(fastify, options) {
	fastify.get('/state/:state/city/:city', getCityPopulationOpts);
	fastify.put('/state/:state/city/:city', putCityPopulationOpts);
}

export default populationRoutes;
