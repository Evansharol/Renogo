import { FALLBACK_DM_REQUESTS, type DmRequest } from "../pages/DealerManager/types";

export { FALLBACK_DM_REQUESTS };

const API_URL = "/api";

export async function getDmRequests(): Promise<DmRequest[]> {
    try {
        const response = await fetch(`${API_URL}/dmRequests`);
        if (!response.ok) throw new Error("Failed to load dealer manager requests");
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            return data as DmRequest[];
        }
        return FALLBACK_DM_REQUESTS;
    } catch {
        return FALLBACK_DM_REQUESTS;
    }
}

export async function getDmRequestsByStatus(status: string): Promise<DmRequest[]> {
    try {
        const response = await fetch(`${API_URL}/dmRequests?status=${encodeURIComponent(status)}`);
        if (!response.ok) throw new Error("Failed to load dealer manager requests");
        return (await response.json()) as DmRequest[];
    } catch {
        return FALLBACK_DM_REQUESTS.filter((r) => r.status === status);
    }
}
