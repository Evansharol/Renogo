import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { BarChart } from "@mui/x-charts/BarChart";
import type { ChartDataPoint } from "../../types";

type OverviewChartProps = {
    data: ChartDataPoint[];
};

const SERIES_CONFIG = [
    { key: "totalRequests" as const, label: "Total Requests", color: "#1d4ed8" },
    { key: "approvedBySalesManager" as const, label: "Approved by Sales Manager", color: "#f59e0b" },
    { key: "awaitingAcknowledgement" as const, label: "Awaiting Acknowledgement", color: "#3b82f6" },
    { key: "paymentPending" as const, label: "Payment Pending", color: "#8b5cf6" },
    { key: "paymentCompleted" as const, label: "Payment Completed", color: "#10b981" },
    { key: "orderConfirmed" as const, label: "Order Confirmed", color: "#06b6d4" },
];

export default function OverviewChart({ data }: OverviewChartProps) {
    const [range, setRange] = useState("7");

    const filteredData = data.slice(-Number(range));

    return (
        <Card
            elevation={0}
            sx={{
                border: "1px solid #eef1f5",
                borderRadius: "14px",
                boxShadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
                transition: "box-shadow 0.2s ease",
                "&:hover": {
                    boxShadow: "0 8px 26px rgba(15, 23, 42, 0.12)",
                },
                height: "100%",
            }}
        >
            <CardContent
                sx={{
                    p: "20px !important",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                }}
            >
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "16px" }}>
                        Request Overview
                    </Typography>
                    <Select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        size="small"
                        sx={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#475569",
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#dbe2ea" },
                            "& .MuiSelect-select": { py: "6px", pr: "28px !important", pl: "10px" },
                            borderRadius: "8px",
                        }}
                    >
                        <MenuItem value="7">Last 7 Days</MenuItem>
                        <MenuItem value="14">Last 14 Days</MenuItem>
                        <MenuItem value="30">Last 30 Days</MenuItem>
                    </Select>
                </Box>

                {/* Centered Chart */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        minHeight: 260,
                    }}
                >
                    <BarChart
                        height={260}
                        xAxis={[
                            {
                                data: filteredData.map((d) => d.date),
                                scaleType: "band",
                                tickLabelStyle: { fontSize: 11, fill: "#94a3b8" },
                            },
                        ]}
                        yAxis={[{ tickLabelStyle: { fontSize: 11, fill: "#94a3b8" } }]}
                        series={SERIES_CONFIG.map((s) => ({
                            data: filteredData.map((d) => d[s.key]),
                            label: s.label,
                            color: s.color,
                        }))}
                        hideLegend
                        margin={{ top: 10, right: 15, bottom: 30, left: 35 }}
                        sx={{
                            width: "100%",
                            "& .MuiChartsAxis-line": { stroke: "#e5e7eb" },
                            "& .MuiChartsAxis-tick": { stroke: "#e5e7eb" },
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
}
