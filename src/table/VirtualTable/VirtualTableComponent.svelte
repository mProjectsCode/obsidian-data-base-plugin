<!-- Made in collaboration between Moritz Jung (https://github.com/mProjectsCode) and Marcus Olsson (https://github.com/marcusolsson) -->
<!-- Thus Marcus Olsson does not have to abide the GPL-3.0 License under which the rest of this plugin is published. -->

<script lang="ts">
	import viewport from 'src/utils/UseViewportAction';
	import {onMount, tick} from 'svelte';

	// @ts-ignore
	type T = $$Generic;

	class Chunk {
		index: number;

		el?: HTMLElement;
		height: number = -1;

		subChunks: SubChunk[];
		numberOfEntries: number;

		visible: boolean;
		wasVisible: boolean;

		constructor(index: number, entries: T[], visible: boolean) {
			this.index = index;
			this.subChunks = [];
			this.visible = visible;
			this.wasVisible = false;
			this.numberOfEntries = entries.length;

			const numSubChunks = Math.ceil(entries.length / entriesPerSubChunk);

			for (let i = 0; i < numSubChunks; i++) {
				let entriesFroSubChunk: T[] = [];
				if (i * entriesPerSubChunk <= entries.length) {
					entriesFroSubChunk = entries.slice(i * entriesPerSubChunk, Math.min((i + 1) * entriesPerSubChunk, entries.length));
				}
				this.subChunks.push(new SubChunk(index, i, entriesFroSubChunk, i <= 1));
			}
		}

		async onTurnVisible() {
			if (!this.el) {
				throw new Error(`error in turning chunk ${this.index} visible, el is undefined`);
			}

			await tick();

			this.height = this.getElHeight();

			if (!fixedHeight) {
				this.el.style.minHeight = `${visibleMinHeight}px`;
			}
			this.wasVisible = true;
		}

		async onTurnInvisible() {
			if (!this.el) {
				throw new Error(`error in turning chunk ${this.index} invisible, el is undefined`);
			}

			if (!fixedHeight) {
				this.el.style.minHeight = `${this.height}px`;
			}
		}

		getElHeight(): number {
			if (!this.el) {
				throw new Error(`can not get el height of chunk ${this.index}, el is undefined`);
			}
			return this.el.clientHeight;
		}

		setHeightToHeightGuess() {
			if (!this.el) {
				throw new Error(`error in changing chunk ${this.index} height, el is undefined`);
			}

			this.el.style.minHeight = `${this.getHeightGuess()}px`;
		}

		getHeightGuess(): number {
			return getSubChunkHeightGuess() * subChunksPerChunk * (this.numberOfEntries / (entriesPerSubChunk * subChunksPerChunk));
		}
	}

	class SubChunk {
		index: number;
		chunkIndex: number;

		el?: HTMLElement;
		height: number = -1;

		entries: { entry: T, el?: HTMLElement }[];
		numberOfEntries: number;

		visible: boolean;
		wasVisible: boolean;

		constructor(chunkIndex: number, index: number, entries: T[], visible: boolean) {
			this.chunkIndex = chunkIndex;
			this.index = index;

			this.visible = visible;
			this.wasVisible = false;
			this.entries = entries.map(x => ({entry: x, el: undefined}));
			this.numberOfEntries = entries.length;
		}

		async onTurnVisible() {
			if (!this.el) {
				throw new Error(`error in turning sub chunk ${this.chunkIndex} ${this.index} visible, el is undefined`);
			}

			await tick();

			this.height = this.getElHeight();
			if (this.index === 0 && this.chunkIndex === 0 && !this.wasVisible && !fixedHeight) {
				updateHeightGuesses(this.height);
			}

			if (!fixedHeight) {
				this.el.style.minHeight = `${visibleMinHeight}px`;
			}
			this.wasVisible = true;
		}

		async onTurnInvisible() {
			if (!this.el) {
				throw new Error(`error in turning sub chunk ${this.chunkIndex} ${this.index} invisible, el is undefined`);
			}

			if (!fixedHeight) {
				this.el.style.minHeight = `${this.height}px`;
			}
		}

		getElHeight(): number {
			if (!this.el) {
				throw new Error(`can not get el height of sub chunk ${this.chunkIndex} ${this.index}, el is undefined`);
			}
			return this.el.clientHeight;
		}

		setHeightToHeightGuess(): void {
			if (!this.el) {
				throw new Error(`error in changing sub chunk ${this.chunkIndex} ${this.index} height, el is undefined`);
			}

			this.el.style.minHeight = `${this.getHeightGuess()}px`;
		}

		getHeightGuess(): number {
			return getSubChunkHeightGuess() * (this.numberOfEntries / entriesPerSubChunk);
		}
	}

	export let entries: T[] = [];

	export let subChunksPerChunk: number = 50;
	export let entriesPerSubChunk: number = 50;

	export let fixedHeight: boolean = false;
	export let entryHeight: number = 20;

	export let debug: boolean = false;

	export const update = () => createChunks();

	let chunks: Chunk[] = [];
	let firstSubChunkHeight: number = -1;
	const visibleMinHeight: number = 1;

	onMount(() => {
		createChunks();
	});

	function createChunks() {
		chunks = [];
		firstSubChunkHeight = -1;

		const entriesPerChunk = entriesPerSubChunk * subChunksPerChunk;
		const numChunks = Math.ceil(entries.length / entriesPerChunk);

		if (debug) {
			console.log(`Virtual Table | created ${numChunks} chunks`);
		}

		for (let i = 0; i < numChunks; i++) {
			const entriesForChunk = entries.slice(i * entriesPerChunk, Math.min((i + 1) * entriesPerChunk, entries.length));
			chunks.push(new Chunk(i, entriesForChunk, i === 0));
		}

		if (debug) {
			console.log(`Virtual Table |`, chunks);
		}

		// tell svelte to update
		chunks = chunks;
	}

	function updateHeightGuesses(height: number): void {
		firstSubChunkHeight = height;

		if (debug) {
			console.log(`Virtual Table | updating guessed height based on first sub chunk height ${firstSubChunkHeight}`);
		}

		for (const chunk of chunks) {
			if (chunk.visible) {
				for (const subChunk of chunk.subChunks) {
					if (!subChunk.visible) {
						subChunk.setHeightToHeightGuess();
					}
				}
			} else {
				chunk.setHeightToHeightGuess();
			}
		}
	}

	function getSubChunkHeightGuess(): number {
		return fixedHeight || firstSubChunkHeight === -1 ? entryHeight * entriesPerSubChunk : firstSubChunkHeight;
	}
</script>

<style>

</style>

<div style="width: fit-content;">
	{#each chunks as chunk}
		<div
			use:viewport
			on:enterViewport={() => {chunk.visible = true; chunk.onTurnVisible()}}
			on:exitViewport={() => {chunk.visible = false; chunk.onTurnInvisible()}}
			style="min-height: {chunk.getHeightGuess()}px; width: fit-content;"
			bind:this={chunk.el}
		>
			{#if chunk.visible}
				{#each chunk.subChunks as subChunk}
					<div
						use:viewport
						on:enterViewport={() => {subChunk.visible = true; subChunk.onTurnVisible()}}
						on:exitViewport={() => {subChunk.visible = false; subChunk.onTurnInvisible()}}
						style="min-height: {subChunk.getHeightGuess()}px; width: fit-content;"
						bind:this={subChunk.el}
					>
						{#if subChunk.visible}
							{#each subChunk.entries as entry}
								<slot name="entry" entry={entry.entry}></slot>
							{/each}
						{:else}
							<span></span>
						{/if}
					</div>
				{/each}
			{:else}
				<span></span>
			{/if}
		</div>
	{/each}
</div>
