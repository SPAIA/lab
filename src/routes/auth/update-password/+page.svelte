<script lang="ts">
	import { Button, Card, Input, Label } from 'flowbite-svelte';
	import { enhance } from '$app/forms';
	import { setError } from '$lib/stores/errorStore';

	export let form;
</script>

<div class="flex min-h-screen w-full items-center justify-center">
	<Card class="w-full max-w-md space-y-6 p-6">
		<h3 class="text-center text-xl font-medium text-gray-900 dark:text-white">Set New Password</h3>

		<form method="POST" action="?/update" use:enhance class="space-y-4">
			<div>
				<Label for="password" class="mb-2">New Password</Label>
				<Input type="password" name="password" id="password" placeholder="••••••••" required />
			</div>

			<Button type="submit" class="w-full">Update Password</Button>
		</form>
	</Card>
</div>
