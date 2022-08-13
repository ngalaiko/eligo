declare namespace App {
	interface Session {
		user?: import('@velit/protocol').User;
		token?: string;
	}
	interface Locals {
		user?: import('@velit/protocol').User;
		token?: string;
	}
}
