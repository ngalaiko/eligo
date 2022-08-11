declare namespace App {
	interface Session {
		user?: import('@picker/protocol').User;
		token?: string;
	}
	interface Locals {
		user?: import('@picker/protocol').User;
		token?: string;
	}
}
