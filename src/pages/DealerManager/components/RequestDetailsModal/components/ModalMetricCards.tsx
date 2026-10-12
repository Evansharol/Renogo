import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import type { DmRequest } from "../../../types";

type ModalMetricCardsProps = {
    request?: DmRequest | null;
};

const metricCardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    p: 2,
    display: "flex",
    alignItems: "center",
    gap: 1.8,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
};

const metricIconStyle = {
    width: 40,
    height: 40,
    borderRadius: "10px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
};

export default function ModalMetricCards({ request }: ModalMetricCardsProps) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                gap: 2,
            }}
        >
            {/* 1. Requested by */}
            <Box sx={metricCardStyle}>
                <Box sx={metricIconStyle}>
                    <PersonOutlineOutlinedIcon sx={{ fontSize: 22, color: "#2563eb" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>Requested by</Typography>
                    <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>Rahul Mehta</Typography>
                    <Typography sx={{ fontSize: "11px", color: "#94a3b8" }}>Salesman (Dealer)</Typography>
                </Box>
            </Box>

            {/* 2. Total Vehicles */}
            <Box sx={metricCardStyle}>
                <Box sx={metricIconStyle}>
                    <DirectionsCarOutlinedIcon sx={{ fontSize: 22, color: "#2563eb" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>Total Vehicles</Typography>
                    <Typography sx={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                        {request?.totalQuantity || 50}
                    </Typography>
                </Box>
            </Box>

            {/* 3. Total Quotation Amount */}
            <Box sx={metricCardStyle}>
                <Box sx={metricIconStyle}>
                    <CurrencyRupeeIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>Total Quotation Amount</Typography>
                    <Typography sx={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                        {request?.quotationAmount || "₹ 2,50,00,000"}
                    </Typography>
                </Box>
            </Box>

            {/* 4. Expected Delivery */}
            <Box sx={metricCardStyle}>
                <Box sx={metricIconStyle}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>Expected Delivery</Typography>
                    <Typography sx={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                        30 Jun 2025
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
