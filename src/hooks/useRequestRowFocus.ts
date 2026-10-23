import { useEffect } from "react";

export const getRequestRowDomId = (requestId: string) => `request-row-${encodeURIComponent(requestId)}`;

export function useRequestRowFocus(requestId: string | undefined, visibleRequestIds: string[]) {
	useEffect(() => {
		if (!requestId || !visibleRequestIds.includes(requestId)) return;

		const frame = window.requestAnimationFrame(() => {
			document.getElementById(getRequestRowDomId(requestId))?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		});

		return () => window.cancelAnimationFrame(frame);
	}, [requestId, visibleRequestIds]);
}
