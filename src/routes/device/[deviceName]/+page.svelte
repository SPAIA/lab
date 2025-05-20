<script lang="ts">
	import { page } from '$app/stores';
	import ImageWithLoading from '$lib/components/ImageWithLoading.svelte';
	import { onMount } from 'svelte';
	import type { ApiResponse, SPAIAEvent } from '$lib/types';
	import { addLoadTask, removeLoadTask } from '$lib/stores/loadStore';
	import { tokenStore, userStore } from '$lib/stores/userStore';
	import FormattedDate from '$lib/components/FormattedDate.svelte';
	import { EyeOutline, EyeSlashOutline } from 'flowbite-svelte-icons';

	// ✅ Svelte 5 state management
	let events = $state<SPAIAEvent[]>([]);
	let limit = $state(15);
	let currentPage = $state(1);
	let lastPage = $state(1);
	let selectedIndex = $state(0);
	let showAOI = $state(true);

	// ✅ Derived state (replaces $:)
	const deviceName = $derived($page.params.deviceName);
	const imgSrc = $derived(
		events.length
			? `https://beta.api.spaia.earth/images/${events[selectedIndex].media[0]?.fileId}`
			: ''
	);

	let imgElement: HTMLImageElement;
	let imgNaturalWidth = 0;
	let imgNaturalHeight = 0;
	let filmStripRef: HTMLDivElement | null = null;
	let imgReady = false;

	let transform = $state<{ scale: number; offsetX: number; offsetY: number } | null>(null);

	function handleImageLoad(e: CustomEvent<{ naturalWidth: number; naturalHeight: number }>) {
		imgNaturalWidth = e.detail.naturalWidth;
		imgNaturalHeight = e.detail.naturalHeight;
		imgReady = true;
		updateTransform();
	}

	function scrollFilmStrip(direction: number) {
		if (filmStripRef) {
			filmStripRef.scrollBy({ left: direction * 200, behavior: 'smooth' });
		}
	}

	async function fetchEvents(deviceName: string): Promise<SPAIAEvent[]> {
		addLoadTask('Loading Events');
		try {
			const response = await fetch(
				`https://beta.api.spaia.earth/device/${deviceName}?hasMedia=true&limit=${limit}&page=${currentPage}&ts=${new Date()}`
			);
			if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
			const result: ApiResponse<SPAIAEvent[]> = await response.json();
			lastPage = result.pagination?.totalPages || 1;
			// Reset to page 1 if current page is beyond new last page
			if (currentPage > lastPage) {
				currentPage = 1;
			}
			return result.data || [];
		} catch (error) {
			console.error(`Error fetching events: ${(error as Error).message}`);
			return [];
		} finally {
			removeLoadTask('Loading Events');
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

	function updateTransform() {
		if (!imgReady || !imgElement) {
			transform = null;
			return;
		}
		console.log('here 2');
		const renderedWidth = imgElement.clientWidth;
		const renderedHeight = imgElement.clientHeight;
		const scale = Math.min(renderedWidth / 320, renderedHeight / 240);
		const offsetX = (renderedWidth - 320 * scale) / 2;
		const offsetY = (renderedHeight - 240 * scale) / 2;
		transform = { scale, offsetX, offsetY };
	}
	$effect(() => {
		if (!imgElement) return;

		const resizeObserver = new ResizeObserver(() => {
			updateTransform();
		});

		resizeObserver.observe(imgElement);

		return () => resizeObserver.disconnect();
	});

	const deleteEvent = async (eventId: number) => {
		addLoadTask('Deleting event.');
		try {
			const response = await fetch(`https://beta.api.spaia.earth/events/${eventId}`, {
				method: 'DELETE'
			});
			if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
			events = events.filter((e) => e.id !== eventId);

			if (selectedIndex >= events.length) {
				selectedIndex = Math.max(0, events.length - 1);
			}
		} catch (error) {
			console.error(`Error deleting events: ${(error as Error).message}`);
			return [];
		} finally {
			removeLoadTask('Deleting event.');
		}
	};
	const verifyEvent = async (eventId: number) => {
		addLoadTask('Deleting event.');

		const token = $derived(tokenStore);
		try {
			const response = await fetch(`https://beta.api.spaia.earth/event/${eventId}/verify`, {
				method: 'PATCH',
				headers: {
					authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			if (!response.ok) throw new Error(`Failed to verify event: ${response.statusText}`);
			events = [...(await fetchEvents(deviceName))];
		} catch (error) {
			console.error(`Error deleting events: ${(error as Error).message}`);
			return [];
		} finally {
			removeLoadTask('Deleting event.');
		}
	};
</script>

{#if events.length}
	<div class="flex h-full w-full flex-col p-4">
		<!-- Main Image Viewer -->
		<div class="flex h-full flex-grow-0 overflow-hidden bg-gray-100">
			<div class="relative m-10 flex max-h-full flex-col overflow-hidden">
				<ImageWithLoading
					bind:imgElement
					src={imgSrc}
					alt="Selected event"
					class="h-auto max-h-[calc(100%-2.5rem)] flex-grow object-contain"
					on:load={handleImageLoad}
				/>
				{#if transform && showAOI}
					{#each events[selectedIndex].regions as region}
						<div
							class="pointer-events-none absolute border-2 border-pink-600 bg-pink-600/20"
							style="
								width: {(region.w ?? 1) * transform.scale}px;
								height: {(region.h ?? 1) * transform.scale}px;
								left: {transform.offsetX + (region.x ?? 0) * transform.scale}px;
								top: {transform.offsetY + (region.y ?? 0) * transform.scale}px;
							"
						></div>
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
								onclick={() => deleteEvent(events[selectedIndex].id)}
								class="rounded-full bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
								>No</button
							>
							<button
								onclick={() => verifyEvent(events[selectedIndex].id)}
								class="rounded-full bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
								>Yes</button
							>
						</div>
					</div>
				</div>
			</div>

			<div class="h-full w-1/3 overflow-y-auto py-4">
				<div class="space-y-3">
					<div>
						<p class="text-base font-semibold">
							<FormattedDate date={events[selectedIndex].time as Date} showTime />
						</p>
					</div>

					<div>
						<h3 class="text-sm font-medium text-gray-500">ID</h3>
						<p class="font-mono text-base">{events[selectedIndex].id}</p>
					</div>

					<div>
						<h3 class="text-sm font-medium text-gray-500">Temperature</h3>
						<p class="text-base">
							{events[selectedIndex].sensordata?.find((data) => data.name == 'Temperature')
								?.value || 'N/A'}°C
						</p>
					</div>

					<div>
						<h3 class="text-sm font-medium text-gray-500">Humidity</h3>
						<p class="text-base">
							{events[selectedIndex].sensordata?.find((data) => data.name == 'Humidity')?.value ||
								'N/A'}%
						</p>
					</div>

					<div>
						<h3 class="text-sm font-medium text-gray-500">Areas of interest</h3>
						<div class="flex">
							<p class="text-base">{events[selectedIndex].regions.length}</p>
							<button
								onclick={() => {
									showAOI = !showAOI;
								}}
							>
								{#if showAOI}
									<EyeSlashOutline class="ms-2 h-6 w-6 text-gray-500" />
								{:else}<EyeOutline class="ms-2 h-6 w-6 text-gray-500" />
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Film Strip with Navigation -->
		<div class="mt-4 flex h-40 w-full items-center">
			<button
				onclick={() => scrollFilmStrip(-1)}
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
					{#each events as event, index (event.id)}
						<button
							onclick={() => (selectedIndex = index)}
							class="shrink-0 transition-all"
							class:selected={selectedIndex === index}
						>
							<div class="h-32 w-32 overflow-hidden rounded-lg">
								<img
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
					onclick={() => scrollFilmStrip(1)}
					class="h-24 w-12 shrink-0 rounded bg-gray-100 hover:bg-gray-200"
				>
					&gt;
				</button>
				<button onclick={nextPage} class="h-8 w-12 shrink-0 rounded bg-gray-100 hover:bg-gray-200">
					&gt;&gt;
				</button>
			</div>
		</div>
	</div>
{/if}
