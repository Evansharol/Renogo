import "../Dealer.css";
import "./Profile.css";

type Props = {
  dealerName: string;
  dealerId: string;
  dealerLocation: string;
};

export default function DealerProfile({ dealerName, dealerId, dealerLocation }: Props) {
  return (
    <div className="dealer-profile-view">
      <div className="dealer-page-title-row">
        <div>
          <h1>Dealership Profile</h1>
          <p>Authorized Renault dealership identification and account preferences.</p>
        </div>
      </div>

      <div className="profile-details-card">
        <div className="profile-header-strip">
          <div className="dealer-avatar-large">DK</div>
          <div>
            <h2>{dealerName}</h2>
            <span className="profile-sub-tag">
              Authorized Renault Dealer Partner • {dealerLocation}
            </span>
          </div>
        </div>

        <div className="profile-fields-grid">
          <div className="profile-field">
            <span>Dealer ID</span>
            <strong>{dealerId}</strong>
          </div>
          <div className="profile-field">
            <span>Authorized Location</span>
            <strong>Chennai Central Hub, Tamil Nadu</strong>
          </div>
          <div className="profile-field">
            <span>GSTIN Identification</span>
            <strong>33AAACR1234F1Z0</strong>
          </div>
          <div className="profile-field">
            <span>Primary Contact</span>
            <strong>dealer.chennai@renault-network.in</strong>
          </div>
          <div className="profile-field">
            <span>Account Status</span>
            <strong className="status-active-text">Active Certified Partner</strong>
          </div>
          <div className="profile-field">
            <span>Fleet Allocation Quota</span>
            <strong>250 Vehicles / Quarter</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
