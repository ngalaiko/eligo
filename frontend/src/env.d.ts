declare namespace App {
	interface Session {
		userId?: string;
		token?: string;
	}
	interface Locals {
		userId: string;
		token?: string;
	}
}
