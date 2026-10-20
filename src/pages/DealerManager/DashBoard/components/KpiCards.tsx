import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import KpiCard from "../../../../components/KpiCard";
import type { DmKpiData } from "../../types";

type KpiCardsProps = {
    kpi: DmKpiData;
};

export default function KpiCards({ kpi }: KpiCardsProps) {
    return (
        <div className="manufacturer-kpi-grid" style={{ marginBottom: "24px" }}>
            <KpiCard
                icon={<DescriptionOutlinedIcon />}
                variant="blue"
                label="Total Requests Received"
                value={kpi.totalRequests}
                subtitle={`↑ ${kpi.weeklyChange.totalRequests} from last week`}
            />
            <KpiCard
                icon={<AccessTimeOutlinedIcon />}
                variant="orange"
                label="Awaiting Acknowledgement"
                value={kpi.awaitingAcknowledgement}
                subtitle={`↑ ${kpi.weeklyChange.awaitingAcknowledgement} from last week`}
            />
            <KpiCard
                icon={<CheckCircleOutlinedIcon />}
                variant="purple"
                label="Payment Completed"
                value={kpi.paymentCompleted}
                subtitle={`↑ ${kpi.weeklyChange.paymentCompleted} from last week`}
            />
            <KpiCard
                icon={<DirectionsCarOutlinedIcon />}
                variant="blue"
                label="Orders Confirmed"
                value={kpi.ordersConfirmed}
                subtitle={`↑ ${kpi.weeklyChange.ordersConfirmed} from last week`}
            />
        </div>
    );
}
