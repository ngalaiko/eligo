import type { Database } from './database.js';
import { SignJWT, generateKeyPair, jwtVerify, exportSPKI, importSPKI } from 'jose';
import { nanoid } from 'nanoid';
import { jwtKeys } from '@eligo/protocol';

export const signer = async (database: Database) =>
	generateKeyPair('ES256')
		.then(async ({ privateKey, publicKey }) => {
			const key = {
				id: nanoid(),
				spki: await exportSPKI(publicKey),
				alg: 'ES256',
				createTime: new Date().getTime()
			};
			await database.append(undefined, jwtKeys.create(key));
			console.log('new jwt key generated');
			return { keyId: key.id, privateKey, keyAlg: 'ES256' };
		})
		.then(({ keyId, keyAlg, privateKey }) => ({
			sign: ({ sub }: { sub: string }) =>
				new SignJWT({})
					.setSubject(sub)
					.setProtectedHeader({ kid: keyId, alg: keyAlg })
					.setExpirationTime('30d')
					.setIssuedAt()
					.sign(privateKey)
		}));

export const verifier = (database: Database) => ({
	verify: (token: string) =>
		jwtVerify(token, async (headers) => {
			if (!headers.kid) throw new Error('missing kid header');
			return database.find('jwtKeys', { id: headers.kid }).then((key) => {
				if (!key) throw new Error(`key '${headers.kid}' not found`);
				return importSPKI(key.spki, key.alg);
			});
		})
});
