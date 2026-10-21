import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { sectionCardStyle } from "../modalStyles";

type RequestStatusStepperProps = {
    acknowledged: boolean;
    orderConfirmed: boolean;
};

export default function RequestStatusStepper({ acknowledged, orderConfirmed }: RequestStatusStepperProps) {
    const steps = [
        { title: "Request Submitted", date: "18 Apr 2025", state: "done" },
        { title: "Sales Manager Review", date: "22 Apr 2025", state: "done" },
        { title: "Approved by Sales Manager", date: "22 Apr 2025", state: "done" },
        {
            title: "Awaiting Dealer Acknowledgement",
            date: acknowledged ? "Completed" : "Current",
            state: acknowledged ? "done" : "active",
        },
        { title: "Payment Pending", date: "", state: orderConfirmed ? "done" : "pending" },
        { title: "Payment Completed", date: orderConfirmed ? "Completed" : "", state: orderConfirmed ? "done" : "pending" },
        { title: "Order Confirmed", date: orderConfirmed ? "Completed" : "", state: orderConfirmed ? "done" : "pending" },
    ];

    return (
        <Box sx={sectionCardStyle}>
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                    Request Status
                </Typography>
            </Box>

            <Box sx={{ overflowX: "auto", pb: 1, pt: 1 }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, minmax(110px, 1fr))",
                        position: "relative",
                        minWidth: 770,
                    }}
                >
                    {steps.map((step, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                position: "relative",
                                px: 1,
                            }}
                        >
                            {/* Horizontal Connecting Line */}
                            {idx < steps.length - 1 && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 11,
                                        left: "50%",
                                        width: "100%",
                                        height: "2px",
                                        backgroundColor: step.state === "done" ? "#16a34a" : "#e2e8f0",
                                        zIndex: 0,
                                    }}
                                />
                            )}

                            {/* Step Icon */}
                            <Box
                                sx={{
                                    zIndex: 1,
                                    backgroundColor: "#ffffff",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 24,
                                    height: 24,
                                    mb: 1,
                                }}
                            >
                                {step.state === "done" && (
                                    <CheckCircleIcon sx={{ fontSize: 22, color: "#16a34a" }} />
                                )}
                                {step.state === "active" && (
                                    <RadioButtonCheckedIcon sx={{ fontSize: 22, color: "#2563eb" }} />
                                )}
                                {step.state === "pending" && (
                                    <RadioButtonUncheckedIcon sx={{ fontSize: 22, color: "#cbd5e1" }} />
                                )}
                            </Box>

                            {/* Step Details */}
                            <Typography
                                sx={{
                                    fontSize: "11.5px",
                                    fontWeight: step.state === "active" ? 800 : step.state === "done" ? 700 : 500,
                                    color: step.state === "active" ? "#2563eb" : step.state === "done" ? "#0f172a" : "#94a3b8",
                                    lineHeight: 1.3,
                                    mb: 0.4,
                                }}
                            >
                                {step.title}
                            </Typography>

                            {step.state === "active" && (
                                <Chip
                                    label="Current"
                                    size="small"
                                    sx={{
                                        backgroundColor: "#eff6ff",
                                        color: "#2563eb",
                                        fontWeight: 700,
                                        fontSize: "9.5px",
                                        height: "18px",
                                    }}
                                />
                            )}

                            {step.date && step.state !== "active" && (
                                <Typography sx={{ fontSize: "10.5px", color: "#64748b" }}>
                                    {step.date}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
