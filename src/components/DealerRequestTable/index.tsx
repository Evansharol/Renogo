import { useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link } from "react-router-dom";
import DealerRequestReviewModal from "../../pages/Manufacturer/DealerRequestReviewModal";

export type DealerRequest = {
  requestId: string;
  dealerId: string;
  dealerName: string;
  model: string;
  color: string;
  quantity: number;
  requestDate: string;
  stockBreakdown: Record<string, number>;
  priority: "High" | "Medium";
  stockStatus: "available" | "low";
  manufacturerStatus: "Fully Allocated" | "Partially Allocated" | "Not Allocated";
};

const PAGE_SIZE = 3;

type DealerRequestTableProps = {
  requests: DealerRequest[];
};

export default function DealerRequestTable({ requests }: DealerRequestTableProps) {
  const [search, setSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState("All Models");
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<DealerRequest | null>(null);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesModel = selectedModel === "All Models" || request.model === selectedModel;
      const matchesSearch = !normalizedSearch
        || [request.dealerId, request.dealerName, request.model, request.color]
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
              <tr key={request.dealerId}>
                <td className="manufacturer-dealer-id">{request.dealerId}</td>
                <td className="manufacturer-dealer-name">{request.dealerName}</td>
                <td>
                  <span className="manufacturer-model-name">{request.model}</span>
                  <span className={`manufacturer-request-status manufacturer-request-status--${request.stockStatus}`}>
                    {request.stockStatus === "available" ? "In Stock" : "Low Stock"}
                  </span>
                </td>
                <td>{request.color}</td>
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
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </section>
  );
}
