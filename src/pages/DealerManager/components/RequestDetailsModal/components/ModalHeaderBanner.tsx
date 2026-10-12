import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

type ModalHeaderBannerProps = {
    requestId: string;
};

export default function ModalHeaderBanner({ requestId }: ModalHeaderBannerProps) {
    return (
        <Box
            sx={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                p: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "10px",
                        backgroundColor: "#eff6ff",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <DescriptionOutlinedIcon fontSize="medium" />
                </Box>
                <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "18px", color: "#0f172a" }}>
                            {requestId}
                        </Typography>
                        <Chip
                            label="Approved by Sales Manager"
                            size="small"
                            sx={{
                                backgroundColor: "#dcfce7",
                                color: "#15803d",
                                fontWeight: 700,
                                fontSize: "11px",
                                height: "22px",
                                borderRadius: "999px",
                            }}
                        />
                    </Box>
                    <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.3 }}>
                        Request Date: <span style={{ fontWeight: 600, color: "#334155" }}>18 Apr 2025</span> &nbsp;|&nbsp;
                        Forwarded to Dealer Manager: <span style={{ fontWeight: 600, color: "#334155" }}>22 Apr 2025</span>
                    </Typography>
                </Box>
            </Box>

            <Button
                variant="outlined"
                startIcon={<DownloadOutlinedIcon sx={{ fontSize: "16px !important" }} />}
                onClick={() => alert(`Downloading Quotation PDF for ${requestId}`)}
                sx={{
                    textTransform: "none",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderColor: "#cbd5e1",
                    color: "#1e293b",
                    borderRadius: "8px",
                    px: 2,
                    py: 0.8,
                    "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f8fafc" },
                }}
            >
                Download Quotation (PDF)
            </Button>
        </Box>
    );
}
