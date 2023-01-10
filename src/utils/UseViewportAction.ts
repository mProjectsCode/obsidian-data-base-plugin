let intersectionObserver: IntersectionObserver;

function ensureIntersectionObserver(): void {
	if (intersectionObserver) return;

	intersectionObserver = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			const eventName = entry.isIntersecting ? 'enterViewport' : 'exitViewport';
			entry.target.dispatchEvent(new CustomEvent(eventName));
		});
	});
}

export default function viewport(element: Element): { destroy: () => void } {
	ensureIntersectionObserver();

	intersectionObserver.observe(element);

	return {
		destroy(): void {
			intersectionObserver.unobserve(element);
		},
	};
}
