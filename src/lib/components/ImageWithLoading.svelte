<script lang="ts">
	export let src: string;
	export let alt: string;

	export let loaded = false;
	let error = false;
	export let naturalWidth = 0;
	export let naturalHeight = 0;
	let imageRef: HTMLImageElement | null = null;

	function onLoad() {
		loaded = true;
		updateImageDimensions();
	}

	function onError() {
		error = true;
	}
	function updateImageDimensions() {
		if (imageRef) {
			// Get the natural dimensions of the image
			naturalWidth = imageRef.naturalWidth;
			naturalHeight = imageRef.naturalHeight;
		}
	}
</script>

<div class="h-full {$$props.class || ''} flex items-center justify-center p-4">
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
