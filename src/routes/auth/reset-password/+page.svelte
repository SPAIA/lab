<script lang="ts">
	import { Button, Card, Input, Label } from 'flowbite-svelte';
	import { enhance } from '$app/forms';
	import { setError } from '$lib/stores/errorStore';

	export let form;
</script>

<div class="flex min-h-screen w-full items-center justify-center">
	<Card class="w-full max-w-md space-y-6 p-6">
		<h3 class="text-center text-xl font-medium text-gray-900 dark:text-white">Reset Password</h3>

		<form method="POST" action="?/reset" use:enhance class="space-y-4">
			<div>
				<Label for="email" class="mb-2">Email</Label>
				<Input name="email" type="email" id="email" placeholder="name@company.com" required />
			</div>

			<Button type="submit" class="w-full">Send Reset Instructions</Button>

			{#if form?.success}
				<p class="text-sm text-green-600 dark:text-green-500">
					Password reset instructions sent! Check your email.
				</p>
			{/if}
		</form>
	</Card>
</div>
