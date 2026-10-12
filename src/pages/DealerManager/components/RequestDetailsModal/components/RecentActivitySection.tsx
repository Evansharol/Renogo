import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { sectionCardStyle, tableHeadStyle, tableBodyStyle } from "../modalStyles";

export default function RecentActivitySection() {
    const activityRows = [
        {
            date: "22 Apr 2025 10:45 AM",
            action: "Request Approved",
            by: "Sales Manager",
            remarks: "Quotation finalized and forwarded to dealer manager",
        },
        {
            date: "18 Apr 2025 04:20 PM",
            action: "Request Submitted",
            by: "Rahul Mehta (Salesman)",
            remarks: "Fleet request created for 3 vehicle models",
        },
        {
            date: "18 Apr 2025 04:15 PM",
            action: "Request Drafted",
            by: "Rahul Mehta (Salesman)",
            remarks: "Initial request saved",
        },
    ];

    return (
        <Box sx={sectionCardStyle}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                    Recent Activity
                </Typography>
            </Box>

            <TableContainer sx={{ border: "1px solid #f1f5f9", borderRadius: "8px" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                            {["Date & Time", "Action", "By", "Remarks"].map((th) => (
                                <TableCell key={th} sx={tableHeadStyle}>{th}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {activityRows.map((row, i) => (
                            <TableRow key={i} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                                <TableCell sx={tableBodyStyle}>{row.date}</TableCell>
                                <TableCell sx={{ ...tableBodyStyle, fontWeight: 700, color: "#0f172a" }}>{row.action}</TableCell>
                                <TableCell sx={tableBodyStyle}>{row.by}</TableCell>
                                <TableCell sx={{ ...tableBodyStyle, color: "#64748b" }}>{row.remarks}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
