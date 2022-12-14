<script lang="ts">
	import { IconDotsCircleHorizontal } from '$lib/assets';
	import { nanoid } from 'nanoid';

	export let options: Record<string, any>[] = [];
	const id = nanoid();
</script>

<details class="dropdown dropdown-right" disabled={options.length === 0}>
	<summary>
		<slot name="title">
			<IconDotsCircleHorizontal />
		</slot>
	</summary>

	<ul>
		{#each options as option, i}
			<li>
				<a href="#{id}.{i}">
					<slot {option} />
				</a>
			</li>
		{/each}
	</ul>
</details>

<style>
	/*!
    * dropjs v12.1.0
    * Simple, mobile-friendly dropdown menus
    * (c) 2019 Chris Ferdinandi
    * MIT License
    * http://github.com/cferdinandi/drop
    */

	/**
    * Add box sizing to all the things
    */
	.dropdown * {
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
	}

	/**
    * Style the clickable text
    * Add your own styles to match other navigation items
    */
	.dropdown > summary {
		cursor: pointer;
	}

	/**
    * Position the dropdown content
    */
	.dropdown {
		display: inline-block;
		position: relative;
	}

	.dropdown > ul {
		background-color: #ffffff;
		border: 1px solid #cecece;
		border-radius: 0.25em;
		list-style: none;
		margin: 0;
		padding: 0;
		position: absolute;
		top: 1.5em;
		z-index: 999;
	}

	.dropdown-right > ul {
		right: 0;
	}

	/**
    * Style the dropdown menu links
    */
	.dropdown > ul > li > a {
		display: inline-block;
		padding: 0.3125em 0.5em;
		width: 100%;
	}

	.dropdown > ul > li > a:hover {
		background-color: #f7f7f7;
	}

	/**
    * @bugfix Prevent webkit from removing list semantics
    * 1. Add a non-breaking space
    * 2. Make sure it doesn't mess up the DOM flow
    */
	.dropdown > ul > li:before {
		content: '\200B';
		/* 1 */
		position: absolute;
		/* 2 */
	}

	/**
    * my custom shit
    **/
	details summary::-webkit-details-marker {
		display: none;
	}
</style>
