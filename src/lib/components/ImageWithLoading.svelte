<script lang="ts">
	export let src: string;
	export let alt: string;
	export let loaded = false;
	let error = false;
	export let naturalWidth = 0;
	export let naturalHeight = 0;
	export let imgElement: HTMLImageElement;

	// Import createEventDispatcher
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function onLoad() {
		loaded = true;
		updateImageDimensions();
		// Dispatch a custom event with dimensions
		dispatch('load', {
			naturalWidth: naturalWidth,
			naturalHeight: naturalHeight
		});
	}

	function onError() {
		error = true;
	}

	function updateImageDimensions() {
		if (imgElement) {
			naturalWidth = imgElement.naturalWidth;
			naturalHeight = imgElement.naturalHeight;
		}
	}
</script>

<div class="flex h-full items-center justify-center p-4" {...$$restProps}>
	{#if !loaded}
		<div class="absolute inset-0 flex items-center justify-center bg-gray-100">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
			></div>
		</div>
	{/if}
	<img
		{src}
		{alt}
		bind:this={imgElement}
		class="max-h-full max-w-full transition-opacity duration-300 {loaded
			? 'opacity-100'
			: 'opacity-0'}"
		on:load={onLoad}
		on:error={onError}
	/>

	{#if error}
		<div class="absolute inset-0 flex items-center justify-center bg-gray-100">
			<span class="text-red-500">Failed to load image</span>
		</div>
	{/if}
</div>
