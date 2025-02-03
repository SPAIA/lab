<script lang="ts">
	import {
		Button,
		Card,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import type { Device } from '$lib/types';
	export let devices: Device[] = [];
</script>

<Card>
	{#if devices.length}
		<div class="space-y-4 p-4">
			{#if devices.length}
				<h2 class="text-lg font">Devices</h2>
				<Table>
					<TableHead>
						<TableHeadCell>Device name</TableHeadCell>
						<TableHeadCell>Last seen</TableHeadCell>
						<TableHeadCell></TableHeadCell>
					</TableHead>
					<TableBody tableBodyClass="divide-y">
						{#each devices as device}
							<TableBodyRow>
								<TableBodyCell>{device.name}</TableBodyCell>
								<TableBodyCell>{device.lastSeen}</TableBodyCell>
								<TableBodyCell><Button>...</Button></TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
			{/if}
		</div>
	{:else}
		<p>No devices found.</p>
	{/if}
	<slot></slot>
</Card>
