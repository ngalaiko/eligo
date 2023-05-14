/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/info" />

declare namespace App {
	interface Locals {
		database: import('@eligo/server').Database;
		tokens: import('@eligo/server').Tokens;
	}
}
