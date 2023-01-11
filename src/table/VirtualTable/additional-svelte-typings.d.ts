declare namespace svelteHTML {
	interface HTMLAttributes<T> {
		'on:enterViewport'?: (e: CustomEvent) => void;
		'on:exitViewport'?: (e: CustomEvent) => void;
	}
}
