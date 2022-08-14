declare namespace App {
	interface Session {
		user?: import('@eligo/protocol').User;
		token?: string;
	}
	interface Locals {
		user?: import('@eligo/protocol').User;
		token?: string;
	}
}
