<!--DEPRECATED-->

<script lang="ts">

	import {onMount} from 'svelte';
	import viewport from '../utils/UseViewportAction';

	class Chunk {
		static subChunksPerChunk = 20;

		height: number = -1;
		subChunks: SubChunk[];
		visible: boolean;
		wasVisible: boolean;
		index: number;
		el?: HTMLElement;

		constructor(index: number, entries: Record<string, any>[], visible: boolean) {
			this.index = index;
			this.subChunks = [];
			this.visible = visible;
			this.wasVisible = false;

			for (let i = 0; i < Chunk.subChunksPerChunk; i++) {
				let entriesFroSubChunk: Record<string, any>[] = [];
				if (i * SubChunk.entriesPerSubChunk <= entries.length) {
					entriesFroSubChunk = entries.slice(i * SubChunk.entriesPerSubChunk, Math.min((i + 1) * SubChunk.entriesPerSubChunk, entries.length));
				}
				this.subChunks.push(new SubChunk(index, i, entriesFroSubChunk, i >= 1));
			}
		}

		setVisible(visible: boolean) {
			this.updateHeight();
			this.visible = visible;
			this.wasVisible = visible ? true : this.wasVisible;
		}

		updateHeight() {
			this.height = this.getHeight();
			this.el.style.minHeight = `${this.height}px`;
		}

		getHeight(): number {
			if (this.visible) {
				return this.el.clientHeight;
			} else {
				return this.height === -1 ? firstSubChunkHeight * Chunk.subChunksPerChunk : this.height;
			}
		}

		getInitialHeight(): number {
			return this.height === -1 ? initialChunkHeight : this.height;
		}
	}

	class SubChunk {
		static entriesPerSubChunk = 50;

		height: number = -1;
		entries: { entry: Record<string, any>, el?: HTMLElement }[];
		visible: boolean;
		wasVisible: boolean;
		index: number;
		chunkIndex: number;
		el?: HTMLElement;

		constructor(chunkIndex: number, index: number, entries: Record<string, any>[], visible: boolean) {
			this.chunkIndex = chunkIndex;
			this.index = index;

			this.visible = visible;
			this.wasVisible = false;
			this.entries = entries.map(x => ({entry: x, el: undefined}));
		}

		setVisible(visible: boolean) {
			if (this.index === 0 && this.chunkIndex === 0 && visible && !this.wasVisible) {
				updateHeights();
			}

			this.updateHeight();
			this.visible = visible;
			this.wasVisible = visible ? true : this.wasVisible;
		}

		updateHeight() {
			this.height = this.getHeight();
			this.el.style.minHeight = `${this.height}px`;
		}

		getHeight(): number {
			if (this.visible) {
				return this.el.clientHeight;
			} else {
				return this.height === -1 ? firstSubChunkHeight : this.height;
			}
		}

		getInitialHeight(): number {
			return this.height === -1 ? initialSubChunkHeight : this.height;
		}
	}

	export let columns: string[];
	export let entries: Record<string, any>[];

	let chunks: Chunk[] = [];
	let firstSubChunkHeight: number = -1;

	const initialChunkHeight = 20 * SubChunk.entriesPerSubChunk * Chunk.subChunksPerChunk;
	const initialSubChunkHeight = 20 * SubChunk.entriesPerSubChunk;

	onMount(() => {
		createChunks();
	});

	function createChunks() {
		const entriesPerChunk = SubChunk.entriesPerSubChunk * Chunk.subChunksPerChunk;
		const numChunks = Math.ceil(entries.length / entriesPerChunk);
		console.log(numChunks);
		for (let i = 0; i < numChunks; i++) {
			const entriesForChunk = entries.slice(i * entriesPerChunk, Math.min((i + 1) * entriesPerChunk, entries.length));
			chunks.push(new Chunk(i, entriesForChunk, i === 0));
		}
		chunks = chunks;
		console.log(chunks, 'chunks');
	}

	function updateHeights(): void {
		firstSubChunkHeight = chunks[0].subChunks[0].el.clientHeight;
		console.log(firstSubChunkHeight, 'first sub chunk height');
		console.log(chunks[0].subChunks[0].el, 'subchunk');
		for (const chunk of chunks) {
			if (chunk.index === 0) {
				for (const subChunk of chunk.subChunks) {
					subChunk.updateHeight();
				}
			}

			chunk.updateHeight();
		}
	}

</script>

<tbody>
{#each chunks as chunk}
	<tr
		use:viewport
		on:enterViewport={() => {chunk.setVisible(true); chunk.visible = chunk.visible}}
		on:exitViewport={() => {chunk.setVisible(false); chunk.visible = chunk.visible}}
		style="min-height: {chunk.getInitialHeight()}px"
		bind:this={chunk.el}
	>
		{#if chunk.visible}
			{#each chunk.subChunks as subChunk}
				<tr
					use:viewport
					on:enterViewport={() => {subChunk.setVisible(true); chunk.visible = chunk.visible}}
					on:exitViewport={() => {subChunk.setVisible(false); chunk.visible = chunk.visible}}
					style="min-height: {subChunk.getInitialHeight()}px"
					bind:this={subChunk.el}
				>
					{#if subChunk.visible}
						{#each subChunk.entries as entry}
							<tr bind:this={entry.el}>
								<slot entry={entry.entry}></slot>
							</tr>
						{/each}
					{/if}
				</tr>
			{/each}
		{/if}
	</tr>
{/each}
</tbody>
