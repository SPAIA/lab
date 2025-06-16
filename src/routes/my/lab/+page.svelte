<script lang="ts">
	import DevicesCard from '$lib/components/DevicesCard.svelte';
	import FormattedDate from '$lib/components/FormattedDate.svelte';
	import { tokenStore, userStore } from '$lib/stores/userStore';
	import type { Device, FieldObservation } from '$lib/types';
	import { Button, Card, Modal } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { get, writable } from 'svelte/store';

	// Create a proper store since DevicesCard expects a store (uses $activeDeviceId)
	const activeDeviceCard = writable(-1);
	let showDeleteModal = writable(false);
	let deviceToDelete: Device | null = $state(null);
	let fieldObservations: FieldObservation[] = $state([]);
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
	onMount(() => {
		const unsubscribe = userStore.subscribe(async (user) => {
			if (!user?.id) return; // Wait until user is available

			const token = get(tokenStore);
			if (!token) return; // Also check token is available

			console.log(user);
			try {
				const response = await fetch(
					`https://beta.api.spaia.earth/field-observations/user/${user.id}`,
					{
						method: 'GET',
						headers: {
							authorization: `Bearer ${token}`,
							'Content-Type': 'application/json'
						}
					}
				);

				const { data } = await response.json();
				fieldObservations = data;
			} catch (err) {
				console.error(err);
			}
		});

		// Cleanup the subscription when component unmounts
		return () => unsubscribe();
	});
</script>

<div class="flex min-h-screen w-full">
	<div class="w-full overflow-scroll p-20">
		<div class="space-y-4">
			<!-- Devices Section -->
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Devices ({devices.length})</h2>
				<Button href="/my/devices/new">Add device</Button>
			</div>

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
			</div>

			<!-- Field Observations Section -->
			<div class="mb-4 mt-8 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Field Observations ({fieldObservations.length})</h2>
				<Button href="/my/observations/new">Add observation</Button>
			</div>

			{#if fieldObservations.length > 0}
				<div class="rounded-lg bg-gray-100 p-4">
					<p>You have {fieldObservations.length} field observations recorded.</p>
					{#each fieldObservations as observation}
						<a href={`/observation/${observation.id}`}
							><FormattedDate date={observation.date}></FormattedDate></a
						>
					{/each}
				</div>
			{:else}
				<div class="rounded-lg bg-gray-100 p-4">
					<p>No field observations found.</p>
				</div>
			{/if}
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
