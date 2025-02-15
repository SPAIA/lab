<script>
	import FormattedDate from '$lib/components/FormattedDate.svelte';
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
	<div class="w-full overflow-scroll p-20">
		<div class="space-y-4">
			<!-- {pagination?.totalCount}
			{$totalDevices} ---
			{$totalDevices > 4 ? 4 : $totalDevices} -->
			<div
				class={`grid w-full gap-2 p-2 grid-cols-${
					$totalDevices > 4 ? 4 : $totalDevices + 1
				} 2xl:grid-cols-${$totalDevices > 6 ? 4 : $totalDevices}`}
			>
				{#if devices.length}
					{#each devices as device}
						<a href={`/device/${device.name}`} class="block grid-flow-col-dense no-underline">
							<div
								class="flex w-full max-w-xs flex-col items-center rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-200 hover:border-blue-200 hover:shadow-lg"
							>
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
										<time class="font-mono text-xs"
											><FormattedDate date={device.lastSeen}></FormattedDate></time
										>
									</div>
								{:else}
									<div class="font-mono text-xs">Waiting for connection.</div>
								{/if}
							</div>
						</a>
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
