declare namespace App {
	interface Session {
		user?: import('@eligo/protocol').User & { id: string };
		token?: string;
	}
	interface Locals {
		user?: import('@eligo/protocol').User & { id: string };
		token?: string;
	}
}
