import Fastify from 'fastify';
import populationRoutes from './routes/populationRoutes.js';

const fastify = Fastify({
	// logger: true,
});

// Register Routes
fastify.register(populationRoutes, { prefix: '/api/population' });

// Restart/Shutdown
['SIGINT', 'SIGTERM'].forEach((signal) => {
	process.on(signal, async () => {
		await fastify.close();

		process.exit(0);
	});
});

// Start Server
async function main() {
	try {
		await fastify.listen({ port: 5555, host: '127.0.0.1' });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

main();
