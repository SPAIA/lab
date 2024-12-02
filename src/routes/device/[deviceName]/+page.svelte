<script lang="ts">
	import { page } from '$app/stores';
	import ImageWithLoading from '$lib/components/ImageWithLoading.svelte';
	import type { ApiResponse, SPAIAEvent } from '$lib/types';
	import { onMount } from 'svelte';
	let events: SPAIAEvent[] = [];
	let limit = 15;
	let currentPage: number = 1;
	let lastPage = 1;
	let selectedIndex = 0;
	$: deviceName = $page.params.deviceName;
	$: imgSrc = events.length
		? `https://beta.api.spaia.earth/images/${events[selectedIndex].media[0]?.fileId}`
		: '';
	let filmStripRef: HTMLDivElement | null = null;

	function scrollFilmStrip(direction: number) {
		if (filmStripRef) {
			const scrollAmount = direction * 200; // Adjust scroll amount per click
			filmStripRef.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		}
	}
	async function fetchEvents(deviceName: string): Promise<SPAIAEvent[]> {
		try {
			const response = await fetch(
				`https://beta.api.spaia.earth/device/${deviceName}?hasMedia=true&limit=${limit}&page=${currentPage}`
			);

			// Validate response status
			if (!response.ok) {
				throw new Error(`Failed to fetch: ${response.statusText}`);
			}

			// Parse and type-cast the response
			const result: ApiResponse<SPAIAEvent[]> = await response.json();
			lastPage = result.pagination?.totalPages || 1;
			return result.data || []; // Default to an empty array if data is undefined
		} catch (error) {
			console.error(`Error fetching events: ${(error as Error).message}`);
			return [];
		}
	}
	const nextPage = async () => {
		if (currentPage < lastPage) {
			currentPage++;
		}

		events = await fetchEvents(deviceName);
		selectedIndex = 0;
	};
	onMount(async () => {
		if (deviceName) {
			events = await fetchEvents(deviceName);
		} else {
			console.warn('Device name is undefined.');
		}
	});
</script>

{#if events.length}
	<div class="flex h-full w-full flex-col p-4">
		<!-- Main Image Viewer -->
		<div class="relative flex-grow overflow-hidden rounded-lg bg-gray-100">
			regions: {events[selectedIndex].regions.length} time: {events[selectedIndex].time} ID: {events[
				selectedIndex
			].id}
			<ImageWithLoading src={imgSrc} alt="Selected event" class="h-full w-full object-contain" />
			<button class="absolute right-5 top-5 h-8 w-8 rounded-full bg-lime-400" on:click={nextPage}>
				+
			</button>
			{#each events[selectedIndex].regions as bbox}
				<div class="w-8">[]</div>
			{/each}
		</div>

		<!-- Film Strip with Navigation -->
		<div class="mt-4 flex h-40 w-full items-center">
			<!-- Left Scroll Button -->
			<button
				on:click={() => scrollFilmStrip(-1)}
				class="h-32 w-12 shrink-0 rounded bg-gray-100 hover:bg-gray-200"
			>
				&lt;
			</button>

			<!-- Film Strip -->
			<div class="mx-2 max-w-full flex-1 overflow-hidden">
				<div
					class="flex w-full gap-2 overflow-x-auto pb-4"
					style="scroll-behavior: smooth;"
					bind:this={filmStripRef}
				>
					{#each events as event, index}
						<button
							on:click={() => (selectedIndex = index)}
							class="shrink-0 transition-all {selectedIndex === index
								? 'ring-2 ring-blue-500 ring-offset-2'
								: ''}"
						>
							<div class="h-32 w-32 overflow-hidden rounded-lg">
								<ImageWithLoading
									src={`https://beta.api.spaia.earth/images/${event.media[0]?.fileId}`}
									alt="Event thumbnail"
									class="h-full w-full object-cover transition-opacity
            {selectedIndex === index ? 'opacity-100' : 'opacity-70 hover:opacity-100'}"
								/>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Right Scroll Button -->
			<button
				on:click={() => scrollFilmStrip(1)}
				class="h-32 w-12 shrink-0 rounded bg-gray-100 hover:bg-gray-200"
			>
				&gt;
			</button>
		</div>
	</div>
{/if}
