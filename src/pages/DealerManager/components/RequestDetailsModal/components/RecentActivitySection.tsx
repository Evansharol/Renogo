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
import type { Order } from "../../../../../types/order";

export default function RecentActivitySection({ order }: { order?: Order }) {
    const activityRows = [...(order?.workflowHistory ?? [])]
        .reverse()
        .map((entry) => ({
            date: Number.isNaN(new Date(entry.timestamp).getTime())
                ? "—"
                : new Date(entry.timestamp).toLocaleString("en-GB"),
            action: entry.status,
            by: entry.owner,
            remarks: entry.remarks || "—",
        }));

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
                        {activityRows.length === 0 && (
                            <TableRow><TableCell colSpan={4} sx={tableBodyStyle}>No workflow activity is recorded for this request.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
