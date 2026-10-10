import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import DealerRequestTable from "../../../components/DealerRequestTable";
import type { DealerRequest } from "../../../components/DealerRequestTable";
import "../../Dealer/Dealer.css";

type DashboardRequestsResponse = {
  dealerRequests: DealerRequest[];
};

export default function ManufacturerViewRequests() {
  const [requests, setRequests] = useState<DealerRequest[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/manufacturer-dashboard.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load dealer requests (${response.status})`);
        }
        return response.json() as Promise<DashboardRequestsResponse>;
      })
      .then((data) => setRequests(data.dealerRequests))
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load dealer requests");
      });
  }, []);

  return (
    <div className="dealer-layout">
      <Sidebar variant="manufacturer" />
      <div className="dealer-content">
        <Navbar adminName="Manufacturer" />
        <main className="dealer-main-scroll">
          <div className="dealer-page-title-row">
            <div>
              <h1>View Requests</h1>
              <p>Review and allocate dealer fleet requests.</p>
            </div>
          </div>
          {error ? <p role="alert">{error}</p> : <DealerRequestTable requests={requests} />}
        </main>
      </div>
    </div>
  );
}
