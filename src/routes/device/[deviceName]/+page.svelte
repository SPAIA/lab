<script lang="ts">
	import { page } from '$app/stores';
	import ImageWithLoading from '$lib/components/ImageWithLoading.svelte';
	import { Button } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import type { ApiResponse, SPAIAEvent } from '$lib/types';

	let events: SPAIAEvent[] = [];
	let limit = 15;
	let currentPage = 1;
	let lastPage = 1;
	let selectedIndex = 0;

	$: deviceName = $page.params.deviceName;
	$: imgSrc = events.length
		? `https://beta.api.spaia.earth/images/${events[selectedIndex].media[0]?.fileId}`
		: '';

	let imgElement: HTMLImageElement;
	let imgNaturalWidth = 0;
	let imgNaturalHeight = 0;
	let filmStripRef: HTMLDivElement | null = null;
	let imgReady = false;

	function handleImageLoad(e: CustomEvent<{ naturalWidth: number; naturalHeight: number }>) {
		imgNaturalWidth = e.detail.naturalWidth;
		imgNaturalHeight = e.detail.naturalHeight;
		imgReady = true;
	}

	function scrollFilmStrip(direction: number) {
		if (filmStripRef) {
			filmStripRef.scrollBy({ left: direction * 200, behavior: 'smooth' });
		}
	}

	async function fetchEvents(deviceName: string): Promise<SPAIAEvent[]> {
		try {
			const response = await fetch(
				`https://beta.api.spaia.earth/device/${deviceName}?hasMedia=true&limit=${limit}&page=${currentPage}`
			);
			if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
			const result: ApiResponse<SPAIAEvent[]> = await response.json();
			lastPage = result.pagination?.totalPages || 1;
			return result.data || [];
		} catch (error) {
			console.error(`Error fetching events: ${(error as Error).message}`);
			return [];
		}
	}

	const nextPage = async () => {
		if (currentPage < lastPage) {
			currentPage++;
			events = await fetchEvents(deviceName);
			selectedIndex = 0;
		}
	};

	onMount(async () => {
		if (deviceName) {
			events = await fetchEvents(deviceName);
		}
	});

	function getImageTransform() {
		console.log('k', imgElement);
		if (!imgElement || imgNaturalWidth === 0) return null;
		const renderedWidth = imgElement.clientWidth;
		const renderedHeight = imgElement.clientHeight;
		const scale = Math.min(renderedWidth / 320, renderedHeight / 240);
		const offsetX = (renderedWidth - 320 * scale) / 2;
		const offsetY = (renderedHeight - 240 * scale) / 2;
		return { scale, offsetX, offsetY };
	}

	$: transform = imgReady ? getImageTransform() : null;
</script>

{#if events.length}
	<div class="flex h-full w-full flex-col p-4">
		<!-- Main Image Viewer -->
		<div class="flex h-full flex-grow-0 overflow-hidden bg-gray-100">
			<div class="relative flex max-h-full flex-col overflow-hidden">
				<ImageWithLoading
					bind:imgElement
					src={imgSrc}
					alt="Selected event"
					class="h-auto max-h-[calc(100%-2.5rem)] flex-grow object-contain"
					on:load={handleImageLoad}
				/>

				{#if transform}
					{#each events[selectedIndex].regions as region}
						<div
							class="pointer-events-none absolute border-2 border-pink-600 bg-pink-600/20"
							style="
                width: {(region.w ?? 1) * transform.scale}px;
                height: {(region.h ?? 1) * transform.scale}px;
                left: {transform.offsetX + region.x * transform.scale}px;
                top: {transform.offsetY + region.y * transform.scale}px;
              "
						>
							{region.x}
						</div>
					{/each}
				{/if}

				<!-- Floating Action Area -->
				<div
					class="absolute bottom-0 left-1/2 flex -translate-x-1/2 transform items-center justify-center space-x-2 rounded-full bg-white p-1 px-4 shadow-lg"
				>
					<div class="m-2 flex w-full flex-col">
						<div class="w-full text-center text-gray-700">Is there a bug in this image?</div>
						<div class="flex w-full justify-around">
							<button
								class="rounded-full bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
								>No</button
							>
							<button
								class="rounded-full bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
								>Yes</button
							>
						</div>
					</div>
				</div>
			</div>

			<div class="h-full w-1/6 p-2">
				regions: {events[selectedIndex].regions.length}<br />
				time: {events[selectedIndex].time}<br />
				ID: {events[selectedIndex].id}
			</div>
		</div>

		<!-- Film Strip with Navigation -->
		<div class="mt-4 flex h-40 w-full items-center">
			<button
				on:click={() => scrollFilmStrip(-1)}
				class="h-32 w-12 shrink-0 rounded bg-gray-100 hover:bg-gray-200"
			>
				&lt;
			</button>

			<div class="mx-2 flex-1 overflow-hidden">
				<div
					class="flex gap-2 overflow-x-auto pb-4"
					bind:this={filmStripRef}
					style="scroll-behavior: smooth;"
				>
					{#each events as event, index}
						<button
							on:click={() => (selectedIndex = index)}
							class="shrink-0 transition-all"
							class:selected={selectedIndex === index}
						>
							<div class="h-32 w-32 overflow-hidden rounded-lg">
								<ImageWithLoading
									src={`https://beta.api.spaia.earth/images/${event.media[0]?.fileId}`}
									alt="Event thumbnail"
									class="h-full w-full object-cover transition-opacity"
								/>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<div class="flex flex-col space-y-1">
				<button
					on:click={() => scrollFilmStrip(1)}
					class="h-24 w-12 shrink-0 rounded bg-gray-100 hover:bg-gray-200"
				>
					&gt;
				</button>
				<button on:click={nextPage} class="h-8 w-12 shrink-0 rounded bg-gray-100 hover:bg-gray-200">
					&gt;&gt;
				</button>
			</div>
		</div>
	</div>
{/if}
