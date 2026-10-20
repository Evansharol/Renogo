import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { sectionCardStyle, tableHeadStyle, tableBodyStyle } from "../modalStyles";

const commitmentPillStyle = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    p: 1.2,
    backgroundColor: "#f8fafc",
    border: "1px solid #f1f5f9",
    borderRadius: "8px",
};

import type { DmRequest } from "../../../types";

type RequestSummarySectionProps = {
    request?: DmRequest | null;
};

export default function RequestSummarySection({ request }: RequestSummarySectionProps) {
    const baseDate = request?.orderDate ? new Date(request.orderDate) : new Date();
    const validDate = isNaN(baseDate.getTime()) ? new Date() : baseDate;
    const deliveryDate = new Date(validDate.getTime() + 45 * 24 * 60 * 60 * 1000);
    const deliveryDateStr = deliveryDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    const vehicleRows = [
        { model: "Kiger", variant: "RXE", req: 20, avail: 15, prod: 5 },
        { model: "Triber", variant: "RXZ", req: 15, avail: 10, prod: 5 },
        { model: "Duster", variant: "RXZ", req: 15, avail: 8, prod: 7 },
    ];

    return (
        <Box sx={sectionCardStyle}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <DescriptionOutlinedIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                    1. Request Summary
                </Typography>
            </Box>

            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#475569", mb: 1 }}>
                Vehicle Details
            </Typography>

            <TableContainer sx={{ border: "1px solid #f1f5f9", borderRadius: "8px", mb: 1.5 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                            {["Model", "Variant", "Requested Qty", "Available Stock", "Production Qty"].map((th) => (
                                <TableCell key={th} sx={tableHeadStyle}>{th}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vehicleRows.map((row, i) => (
                            <TableRow key={i} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                                <TableCell sx={tableBodyStyle}><strong>{row.model}</strong></TableCell>
                                <TableCell sx={tableBodyStyle}>{row.variant}</TableCell>
                                <TableCell sx={tableBodyStyle}>{row.req}</TableCell>
                                <TableCell sx={tableBodyStyle}>{row.avail}</TableCell>
                                <TableCell sx={tableBodyStyle}>{row.prod}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Commitments mini pills */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                    gap: 1.2,
                }}
            >
                <Box sx={commitmentPillStyle}>
                    <Inventory2OutlinedIcon sx={{ fontSize: 16, color: "#2563eb", flexShrink: 0 }} />
                    <Box>
                        <Typography sx={{ fontSize: "10.5px", fontWeight: 600, color: "#64748b" }}>Stock Allocation</Typography>
                        <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>33 vehicles available</Typography>
                    </Box>
                </Box>
                <Box sx={commitmentPillStyle}>
                    <PrecisionManufacturingOutlinedIcon sx={{ fontSize: 16, color: "#2563eb", flexShrink: 0 }} />
                    <Box>
                        <Typography sx={{ fontSize: "10.5px", fontWeight: 600, color: "#64748b" }}>Manufacturing Commitment</Typography>
                        <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>17 vehicles to be produced</Typography>
                    </Box>
                </Box>
                <Box sx={commitmentPillStyle}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "#2563eb", flexShrink: 0 }} />
                    <Box>
                        <Typography sx={{ fontSize: "10.5px", fontWeight: 600, color: "#64748b" }}>Delivery Commitment</Typography>
                        <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>{deliveryDateStr}</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
