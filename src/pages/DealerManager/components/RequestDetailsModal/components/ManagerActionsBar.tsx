import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { sectionCardStyle, actionCircleIconStyle } from "../modalStyles";

type ManagerActionsBarProps = {
    acknowledged: boolean;
    acknowledging?: boolean;
    onAcknowledge: () => void;
    onViewPaymentDetails?: () => void;
    onUploadPaymentProof?: () => void;
    paymentSubmitted?: boolean;
    canUploadPayment?: boolean;
};

export default function ManagerActionsBar({
    acknowledged,
    acknowledging = false,
    onAcknowledge,
    onViewPaymentDetails,
    onUploadPaymentProof,
    paymentSubmitted = false,
    canUploadPayment = true,
}: ManagerActionsBarProps) {
    return (
        <Box
            sx={{
                ...sectionCardStyle,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
                mt: 0.5,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box sx={actionCircleIconStyle}>
                    <PersonOutlineOutlinedIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                        Dealer Manager Actions
                    </Typography>
                    <Typography sx={{ fontSize: "11.5px", color: "#64748b" }}>
                        Accept terms, view manufacturer bank credentials, and upload proof.
                    </Typography>
                </Box>
            </Box>

            {/* Horizontal Action Buttons */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                }}
            >
                {/* 1. Acknowledge */}
                <Button
                    variant="contained"
                    startIcon={<CheckCircleOutlinedIcon sx={{ fontSize: "16px !important" }} />}
                    disabled={acknowledged || acknowledging}
                    onClick={onAcknowledge}
                    sx={{
                        backgroundColor: acknowledged ? "#16a34a" : "#0f2b5c",
                        color: "#ffffff",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "8px",
                        px: 2.5,
                        py: 0.9,
                        whiteSpace: "nowrap",
                        "&:hover": { backgroundColor: acknowledged ? "#15803d" : "#1e3a8a" },
                    }}
                >
                    {acknowledged ? "✓ Acknowledged" : acknowledging ? "Saving..." : "Acknowledge"}
                </Button>

                {/* 2. View Payment Details */}
                <Button
                    variant="outlined"
                    startIcon={<CreditCardOutlinedIcon sx={{ fontSize: "16px !important" }} />}
                    onClick={onViewPaymentDetails}
                    sx={{
                        borderColor: "#2563eb",
                        color: "#2563eb",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "8px",
                        px: 2.2,
                        py: 0.9,
                        whiteSpace: "nowrap",
                        "&:hover": { backgroundColor: "#eff6ff", borderColor: "#1d4ed8" },
                    }}
                >
                    View Payment Details
                </Button>

                {/* 3. Upload Payment Proof */}
                <Button
                    variant={paymentSubmitted ? "contained" : "outlined"}
                    startIcon={
                        paymentSubmitted ? (
                            <CheckCircleOutlinedIcon sx={{ fontSize: "16px !important" }} />
                        ) : (
                            <CloudUploadOutlinedIcon sx={{ fontSize: "16px !important" }} />
                        )
                    }
                    onClick={onUploadPaymentProof}
                    disabled={!canUploadPayment}
                    sx={{
                        borderColor: paymentSubmitted ? "#16a34a" : "#2563eb",
                        backgroundColor: paymentSubmitted ? "#16a34a" : "transparent",
                        color: paymentSubmitted ? "#ffffff" : "#2563eb",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "8px",
                        px: 2.2,
                        py: 0.9,
                        whiteSpace: "nowrap",
                        "&:hover": {
                            backgroundColor: paymentSubmitted ? "#15803d" : "#eff6ff",
                            borderColor: paymentSubmitted ? "#15803d" : "#1d4ed8",
                        },
                    }}
                >
                    {paymentSubmitted ? "Payment Proof Uploaded" : "Upload Payment Proof"}
                </Button>
            </Box>
        </Box>
    );
}
