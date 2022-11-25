import polka from 'polka';

export const handler = polka().get('/', (_req, res) => {
	res.statusCode = 200;
	res.end();
});
