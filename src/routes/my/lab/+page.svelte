<script>
	import { Button, Card } from 'flowbite-svelte';
	let { data } = $props();
	let { user } = $derived(data);
</script>

<div class="flex min-h-screen w-full">
	<div class="p-20">
		<div class="mt-px space-y-4">
			<div class="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
				<Card size="xl">
					{JSON.stringify(user)}
					<Button>Add a device</Button>
				</Card>
			</div>
		</div>
	</div>
</div>
