import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { sectionCardStyle } from "../modalStyles";

type ManufacturerBankDetailsProps = {
    requestId: string;
};

export default function ManufacturerBankDetails({ requestId }: ManufacturerBankDetailsProps) {
    const bankDetails = [
        { label: "Beneficiary Name", val: "Renault India Pvt Ltd" },
        { label: "Bank Name", val: "HDFC Bank" },
        { label: "Account Number", val: "XXXXXXXXXX" },
        { label: "IFSC Code", val: "HDFC0001234" },
        { label: "Branch", val: "Gurgaon, Haryana" },
    ];

    return (
        <Box sx={sectionCardStyle}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <AccountBalanceOutlinedIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                    3. Manufacturer Bank Details
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                {bankDetails.map((item, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            py: 0.3,
                            borderBottom: "1px dashed #f1f5f9",
                        }}
                    >
                        <Typography sx={{ fontSize: "12px", color: "#64748b" }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{item.val}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Payment instructions alert */}
            <Box
                sx={{
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "10px",
                    p: 1.5,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.6 }}>
                    <InfoOutlinedIcon sx={{ fontSize: 16, color: "#2563eb" }} />
                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1e40af" }}>
                        Payment Instructions
                    </Typography>
                </Box>
                <Box component="ul" sx={{ m: 0, pl: 2, fontSize: "11px", color: "#3b82f6", lineHeight: 1.5 }}>
                    <li>Make payment through NEFT / RTGS only.</li>
                    <li>Use the request ID (<strong>{requestId}</strong>) as reference.</li>
                    <li>Share transaction details after payment.</li>
                </Box>
            </Box>
        </Box>
    );
}
