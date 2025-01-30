<script>
	import DeviceCard from '$lib/components/DeviceCard.svelte';
	import { Button, Card } from 'flowbite-svelte';
	import { writable } from 'svelte/store';
	let { data } = $props();
	let { user } = $derived(data);
	let { devices } = $derived(data);
	let { pagination } = $derived(data);
	let totalDevices = writable(1);
	$effect(() => {
		console.log('pagination', pagination);
		totalDevices.set(pagination?.totalCount ?? 2);
	});
</script>

<div class="flex min-h-screen w-full">
	<div class="w-full p-20">
		<div class="space-y-4">
			<!-- {pagination?.totalCount}
			{$totalDevices} ---
			{$totalDevices > 4 ? 4 : $totalDevices} -->
			<div
				class={`grid w-full gap-2 p-2 md:grid-cols-${
					$totalDevices > 4 ? 4 : $totalDevices
				} 2xl:grid-cols-${$totalDevices > 6 ? 4 : $totalDevices}`}
			>
				{#if devices.length}
					{#each devices as device}
						<Card class="flex flex-col items-center p-4">
							<h2 class="font text-lg">{device.name}</h2>
						</Card>
					{/each}
				{:else}
					<p>No devices found.</p>
				{/if}
				<Card class="flex w-full flex-col items-center p-4">
					<h2 class="font text-lg">Add new device</h2>
					<Button href="/my/devices/new">Add device</Button>
				</Card>
			</div>
		</div>
	</div>
</div>
