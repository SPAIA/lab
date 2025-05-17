<script lang="ts">
	import type { Device } from '$lib/types';
	import FormattedDate from './FormattedDate.svelte';
	import { Dropdown, DropdownItem } from 'flowbite-svelte';

	const { device, activeDeviceId } = $props<{
		device: Device;
		activeDeviceId: number;
	}>();

	// State to control dropdown visibility
	let dropdownOpen = $derived(activeDeviceId === device.id);

	// Handle update config action
	const handleUpdateConfig = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		// Navigate to update config page
		window.location.href = `/my/devices/${device.name}/config`;
	};
</script>

<div class="relative block w-full no-underline">
	<a href={`/device/${device.name}`} class="block no-underline">
		<div
			class="flex flex w-full rounded-lg border border-gray-200 bg-white p-2 shadow-md transition-shadow duration-200 hover:border-blue-200 hover:shadow-lg"
		>
			<!-- Menu button in top right corner -->

			<img src="/images/spaia.png" class="w-20" alt="SPAIA" />
			<div class="ml-2 flex h-full flex-col">
				<h2
					class="group-hover:text-primary0 m0-0 text-lg font-semibold text-gray-800 transition-colors"
				>
					{device.name}
				</h2>
				{#if device.lastSeen}
					<div class="mt-auto flex items-center gap-1 text-sm text-xs text-gray-500">
						<!-- <svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg> -->
						<div class="flex flex-col">
							<span>Last seen:</span>
							<time class=" text-xs">
								<FormattedDate date={device.lastSeen} />
							</time>
						</div>
					</div>
				{:else}
					<div class="font-mono text-xs">Waiting for connection.</div>
				{/if}
			</div>
		</div>
	</a>
</div>
