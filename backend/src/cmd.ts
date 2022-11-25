import yargs from 'yargs';

export const argv = yargs(process.argv.slice(2))
	.usage('Usage: $0 [options]')
	.option('database', {
		alias: 'd',
		describe: 'Database path',
		default: './database.dev.jsonl'
	})
	.option('port', {
		alias: 'p',
		describe: 'Port to listen on',
		default: 31337
	})
	.option('host', {
		alias: 'h',
		describe: 'Host to listen on',
		default: 'localhost'
	})
	.option('vapid-public-key', {
		describe: 'Public VAPID key to send WebPush notifications',
		default:
			'BOf5qTvP_zovZipWAEL9lKsiGJC7nMs6qeTIvWoef05EQdSpGksLXCwVJ147qbAM4DO9tOrs8dAQEkQJCxXV0kc'
	})
	.option('vapid-private-key-path', {
		describe: 'Path to a file with VALID private key to send WebPush notifications',
		default: './vapid-private-key.txt'
	})
	.parseSync();
