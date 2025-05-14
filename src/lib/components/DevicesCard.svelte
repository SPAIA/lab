<script lang="ts">
	import type { Device } from '$lib/types';
	import FormattedDate from './FormattedDate.svelte';
	import { Dropdown, DropdownItem } from 'flowbite-svelte';

	interface DeviceCardProps {
		device: Device;
		activeDeviceId: number;
		closeAllMenus: () => void;
		deleteDevice?: (device: Device) => void;
	}

	const { device, activeDeviceId, closeAllMenus, deleteDevice } = $props() as DeviceCardProps;

	// State to control dropdown visibility
	let dropdownOpen = $derived(activeDeviceId === device.id);

	// Stop propagation to prevent navigation when clicking the menu
	const handleMenuClick = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		closeAllMenus();
	};

	// Handle delete action
	const handleDelete = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		// Add your delete logic here
		console.log('Delete device:', device.name);
		deleteDevice?.(device);
	};

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
			class="flex w-full max-w-xs flex-col items-center rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-200 hover:border-blue-200 hover:shadow-lg"
		>
			<!-- Menu button in top right corner -->
			<button
				class="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100"
				on:click={handleMenuClick}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
					/>
				</svg>

				<!-- Dropdown menu -->
				<Dropdown open={dropdownOpen} placement="bottom-end" class="w-44">
					<DropdownItem on:click={handleUpdateConfig}>Update Config</DropdownItem>
					<DropdownItem class="text-red-600" on:click={handleDelete}>Delete</DropdownItem>
				</Dropdown>
			</button>

			<img src="/images/spaia.png" class="" alt="SPAIA" />
			<h2
				class="group-hover:text-primary0 mb-2 text-xl font-semibold text-gray-800 transition-colors"
			>
				{device.name}
			</h2>

			{#if device.lastSeen}
				<div class="mt-auto flex items-center gap-2 text-sm text-gray-500">
					<svg
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
					</svg>
					<span>Last seen:</span>
					<time class="font-mono text-xs">
						<FormattedDate date={device.lastSeen} />
					</time>
				</div>
			{:else}
				<div class="font-mono text-xs">Waiting for connection.</div>
			{/if}
		</div>
	</a>
</div>
