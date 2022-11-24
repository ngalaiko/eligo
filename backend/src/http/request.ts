import type { Request as PolkaRequest } from 'polka';

export type Request = PolkaRequest & { userId?: string };
