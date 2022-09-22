import type { Database } from './db';
import { SignJWT, generateKeyPair, jwtVerify, exportSPKI, importSPKI } from 'jose';
import { nanoid } from 'nanoid';
import { jwtKeys } from '@eligo/state';

export const init = async (database: Database) => {
	const { keyId, privateKey, keyAlg } = await generateKeyPair('ES256').then(
		async ({ privateKey, publicKey }) => {
			const key = {
				id: nanoid(),
				spki: await exportSPKI(publicKey),
				alg: 'ES256',
				createTime: new Date().getTime()
			};
			await database.append(undefined, jwtKeys.create(key));
			return { keyId: key.id, privateKey, keyAlg: 'ES256' };
		}
	);

	return {
		sign: ({ sub }: { sub: string }) =>
			new SignJWT({})
				.setSubject(sub)
				.setProtectedHeader({ kid: keyId, alg: keyAlg })
				.setExpirationTime('30d')
				.setIssuedAt()
				.sign(privateKey),

		verify: (token: string) =>
			jwtVerify(token, async (headers) => {
				if (!headers.kid) throw new Error('missing kid header');
				return database.find('jwtKeys', { id: headers.kid }).then((key) => {
					if (!key) throw new Error(`key '${headers.kid}' not found`);
					return importSPKI(key.spki, key.alg);
				});
			})
	};
};

type Unwrap<T> = T extends Promise<infer U>
	? U
	: T extends (...args: any) => Promise<infer U>
	? U
	: T extends (...args: any) => infer U
	? U
	: T;

export type Tokens = Unwrap<ReturnType<typeof init>>;

export default init;
