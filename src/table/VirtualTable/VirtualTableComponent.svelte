<script lang="ts">
	import viewport from 'src/utils/UseViewportAction';
	import {onMount, tick} from 'svelte';
	import {fade} from 'svelte/transition';

	// @ts-ignore
	type T = $$Generic;

	class Chunk {
		static subChunksPerChunk = 50;

		height: number = -1;
		subChunks: SubChunk[];
		visible: boolean;
		wasVisible: boolean;
		index: number;
		el?: HTMLElement;

		constructor(index: number, entries: T[], visible: boolean) {
			this.index = index;
			this.subChunks = [];
			this.visible = visible;
			this.wasVisible = false;

			for (let i = 0; i < Chunk.subChunksPerChunk; i++) {
				let entriesFroSubChunk: T[] = [];
				if (i * SubChunk.entriesPerSubChunk <= entries.length) {
					entriesFroSubChunk = entries.slice(i * SubChunk.entriesPerSubChunk, Math.min((i + 1) * SubChunk.entriesPerSubChunk, entries.length));
				}
				this.subChunks.push(new SubChunk(index, i, entriesFroSubChunk, i >= 1));
			}
		}

		async onTurnVisible() {
			if (!this.el) {
				throw new Error(`error in turning chunk ${this.index} visible, el is undefined`);
			}

			await tick();

			this.height = this.getElHeight();

			this.el.style.minHeight = `0px`;
			this.wasVisible = true;
		}

		async onTurnInvisible() {
			if (!this.el) {
				throw new Error(`error in turning chunk ${this.index} invisible, el is undefined`);
			}

			this.el.style.minHeight = `${this.height}px`;
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

			this.el.style.minHeight = `${getChunkHeightGuess()}px`;
		}
	}

	class SubChunk {
		static entriesPerSubChunk = 50;

		height: number = -1;
		entries: { entry: T, el?: HTMLElement }[];
		visible: boolean;
		wasVisible: boolean;
		index: number;
		chunkIndex: number;
		el?: HTMLElement;

		constructor(chunkIndex: number, index: number, entries: T[], visible: boolean) {
			this.chunkIndex = chunkIndex;
			this.index = index;

			this.visible = visible;
			this.wasVisible = false;
			this.entries = entries.map(x => ({entry: x, el: undefined}));
		}

		async onTurnVisible() {
			if (!this.el) {
				throw new Error(`error in turning sub chunk ${this.chunkIndex} ${this.index} visible, el is undefined`);
			}

			await tick();

			this.height = this.getElHeight();
			if (this.index === 0 && this.chunkIndex === 0 && !this.wasVisible) {
				updateHeightGuesses(this.height);
			}

			this.el.style.minHeight = `0px`;
			this.wasVisible = true;
		}

		async onTurnInvisible() {
			if (!this.el) {
				throw new Error(`error in turning sub chunk ${this.chunkIndex} ${this.index} invisible, el is undefined`);
			}

			this.el.style.minHeight = `${this.height}px`;
		}

		getElHeight(): number {
			if (!this.el) {
				throw new Error(`can not get el height of sub chunk ${this.chunkIndex} ${this.index}, el is undefined`);
			}
			return this.el.clientHeight;
		}

		setHeightToHeightGuess() {
			if (!this.el) {
				throw new Error(`error in changing sub chunk ${this.chunkIndex} ${this.index} height, el is undefined`);
			}

			this.el.style.minHeight = `${getSubChunkHeightGuess()}px`;
		}
	}

	export let entries: T[] = [];
	export let fixedHeight: boolean = false;
	export let entryHeight: number = 20;
	export let debug: boolean = false;

	let chunks: Chunk[] = [];
	let firstSubChunkHeight: number = -1;

	const initialChunkHeight = entryHeight * SubChunk.entriesPerSubChunk * Chunk.subChunksPerChunk;
	const initialSubChunkHeight = entryHeight * SubChunk.entriesPerSubChunk;

	const fadeAnimation = (node, args) => fade(node, args);

	onMount(() => {
		createChunks();
	});

	function createChunks() {
		const entriesPerChunk = SubChunk.entriesPerSubChunk * Chunk.subChunksPerChunk;
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
					subChunk.setHeightToHeightGuess();
				}
			} else {
				chunk.setHeightToHeightGuess();
			}
		}
	}

	function getChunkHeightGuess(): number {
		return getSubChunkHeightGuess() * Chunk.subChunksPerChunk;
	}

	function getSubChunkHeightGuess(): number {
		return firstSubChunkHeight === -1 ? entryHeight * SubChunk.entriesPerSubChunk : firstSubChunkHeight;
	}
</script>

<style>

</style>

<div>
	{#each chunks as chunk}
		<div
			use:viewport
			on:enterViewport={() => {chunk.visible = true; chunk.onTurnVisible()}}
			on:exitViewport={() => {chunk.visible = false; chunk.onTurnInvisible()}}
			style="min-height: {getChunkHeightGuess()}px"
			bind:this={chunk.el}
		>
			{#if chunk.visible}
				{#each chunk.subChunks as subChunk}
					<div
						use:viewport
						on:enterViewport={() => {subChunk.visible = true; subChunk.onTurnVisible()}}
						on:exitViewport={() => {subChunk.visible = false; subChunk.onTurnInvisible()}}
						style="min-height: {getSubChunkHeightGuess()}px"
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
