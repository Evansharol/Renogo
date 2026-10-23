import { useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link } from "react-router-dom";
import DealerRequestReviewModal from "../../pages/Manufacturer/DealerRequestReviewModal";
import { getRequestRowDomId, useRequestRowFocus } from "../../hooks/useRequestRowFocus";

export type DealerRequest = {
  requestId: string;
  requestNumber?: string;
  dealerId: string;
  dealerName: string;
  model: string;
  color: string;
  quantity: number;
  items?: Array<{ model: string; variant: string; color?: string; quantity: number }>;
  requestDate: string;
  stockBreakdown: Record<string, number>;
  priority: "High" | "Medium";
  stockStatus: "available" | "low";
  manufacturerStatus: "Fully Allocated" | "Partially Allocated" | "Not Allocated";
};

const PAGE_SIZE = 3;

type DealerRequestTableProps = {
  requests: DealerRequest[];
  onRequestAllocated?: (request: DealerRequest) => void;
  targetRequestId?: string;
};

export default function DealerRequestTable({ requests, onRequestAllocated, targetRequestId }: DealerRequestTableProps) {
  const [search, setSearch] = useState(targetRequestId ?? "");
  const [selectedModel, setSelectedModel] = useState("All Models");
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<DealerRequest | null>(null);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesModel = selectedModel === "All Models" || request.model.includes(selectedModel);
      const matchesSearch = !normalizedSearch
        || [request.requestNumber ?? "", request.requestId, request.dealerId, request.dealerName, request.model, request.color]
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      return matchesModel && matchesSearch;
    });
  }, [requests, search, selectedModel]);

  const pageCount = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRequests = filteredRequests.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  useRequestRowFocus(targetRequestId, visibleRequests.map((request) => request.requestId));

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const updateModel = (value: string) => {
    setSelectedModel(value);
    setPage(1);
  };

  return (
    <section className="manufacturer-requests-section" aria-labelledby="dealer-requests-title">
      <div className="manufacturer-section-heading">
        <h2 id="dealer-requests-title">Dealer Fleet Requests</h2>  
        <Link className="manufacturer-view-all-link" to="/manufacturer/view-requests">
          View All
        </Link>
      </div>

      <div className="manufacturer-table-toolbar">
        <label className="manufacturer-search-field">
          <SearchIcon aria-hidden="true" />
          <span className="visually-hidden">Search dealer requests</span>
          <input
            type="search"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Search requests..."
          />
        </label>
        <label className="manufacturer-model-filter">
          <span className="visually-hidden">Filter by model</span>
          <select value={selectedModel} onChange={(event) => updateModel(event.target.value)}>
            <option>All Models</option>
            {[...new Set(requests.map((request) => request.model))].map((model) => (
              <option key={model}>{model}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="manufacturer-table-wrapper">
        <table className="manufacturer-requests-table">
          <thead>
            <tr>
              <th>Dealer ID</th>
              <th>Dealer Name</th>
              <th>Model</th>
              <th>Color</th>
              <th>Quantity</th>
              <th>Priority</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {visibleRequests.map((request) => (
              <tr
                key={request.requestId}
                id={getRequestRowDomId(request.requestId)}
                className={request.requestId === targetRequestId ? "notification-target-row" : undefined}
              >
                <td className="manufacturer-dealer-id">{request.dealerId}</td>
                <td className="manufacturer-dealer-name">{request.dealerName}</td>
                <td>
                  {request.items?.length ? request.items.map((item) => (
                    <span className="manufacturer-model-name" key={`${item.model}-${item.variant}-${item.color ?? ""}`}>
                      {item.model} - {item.variant} ({item.quantity})
                    </span>
                  )) : <span className="manufacturer-model-name">{request.model}</span>}
                  <span className={`manufacturer-request-status manufacturer-request-status--${request.stockStatus}`}>
                    {request.stockStatus === "available" ? "In Stock" : "Low Stock"}
                  </span>
                </td>
                <td>{request.items?.length ? request.items.map((item) => (
                  <span key={`${item.model}-${item.variant}-${item.color ?? ""}`}>{item.color ?? "Any"}</span>
                )) : request.color}</td>
                <td>{request.quantity}</td>
                <td>
                  <span className={`manufacturer-priority-badge manufacturer-priority-badge--${request.priority.toLowerCase()}`}>
                    {request.priority}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="manufacturer-review-button"
                    onClick={() => setSelectedRequest(request)}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {!visibleRequests.length && (
              <tr>
                <td className="manufacturer-empty-state" colSpan={7}>No dealer requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="manufacturer-table-footer">
        <span>
          Showing {visibleRequests.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}
          {" - "}
          {Math.min(currentPage * PAGE_SIZE, filteredRequests.length)} of {filteredRequests.length} requests
        </span>
        <div className="manufacturer-pagination" aria-label="Request table pagination">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ChevronLeftIcon />
          </button>
          <strong>{currentPage}</strong>
          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage === pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
      {selectedRequest && (
        <DealerRequestReviewModal
          request={selectedRequest}
          onAllocated={(updatedRequest) => {
            onRequestAllocated?.(updatedRequest);
            setSelectedRequest(null);
          }}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </section>
  );
}
