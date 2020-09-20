<script context="module">
	export const preload = () => {};
</script>

<script>
	export let segment: string = "";
	// Silence unused export property warning
	if (segment) {};
</script>

<slot />
