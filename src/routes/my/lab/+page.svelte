<script lang="ts">
	import DevicesCard from '$lib/components/DevicesCard.svelte';
	import type { Device } from '$lib/types';
	import { Button, Card, Modal } from 'flowbite-svelte';
	import { writable } from 'svelte/store';

	// Create a proper store since DevicesCard expects a store (uses $activeDeviceId)
	const activeDeviceCard = writable(-1);
	let showDeleteModal = writable(false);
	let deviceToDelete: Device | null = null;
	interface Props {
		data: {
			user: any;
			devices: any[];
			pagination?: { totalCount: number };
		};
	}

	// Use Svelte 5 runes for props
	let { data } = $props() as Props;

	// Use derived values with the $derived rune
	let { devices, pagination, user } = $derived(data);
	let totalDevices = $derived(pagination?.totalCount ?? 2);

	// Compute grid column classes reactively
	let mainGridCols = $derived(`grid-cols-${totalDevices > 4 ? 4 : totalDevices + 1}`);
	let xlGridCols = $derived(`2xl:grid-cols-${totalDevices > 6 ? 4 : totalDevices}`);

	// Debug with $inspect
	$inspect({ pagination, totalDevices });
	const deleteDevice = (device: Device) => {
		showDeleteModal.set(true);
		deviceToDelete = device;
	};
	const confirmDelete = () => {
		alert('delete');
		showDeleteModal.set(false);
	};
</script>

<div class="flex min-h-screen w-full">
	<div class="w-full overflow-scroll p-20">
		<div class="space-y-4">
			<div class={`grid w-full gap-2 p-2 ${mainGridCols} ${xlGridCols}`}>
				{#if devices.length}
					{#each devices as device}
						<DevicesCard
							{device}
							deleteDevice={(device: Device) => deleteDevice(device)}
							activeDeviceId={$activeDeviceCard}
							closeAllMenus={() => {
								activeDeviceCard.set(device.id);
							}}
						/>
					{/each}
				{:else}
					<p>No devices found.</p>
				{/if}
				<Card class="flex w-full flex-col items-center justify-center p-4">
					<h2 class="font text-lg">Add new device</h2>
					<Button href="/my/devices/new">Add device</Button>
				</Card>
			</div>
		</div>
	</div>
</div>

<Modal title="Confirm Delete" bind:open={$showDeleteModal} autoclose>
	<p class="mb-4">Are you sure you want to delete {deviceToDelete?.name}?</p>

	<div class="flex justify-end gap-4">
		<Button on:click={() => showDeleteModal.set(false)}>Cancel</Button>
		<Button color="red" on:click={confirmDelete}>Delete Permanently</Button>
	</div>
</Modal>
