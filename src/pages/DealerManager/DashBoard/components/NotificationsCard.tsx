import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { DmNotification } from "../../types";

const ICON_MAP: Record<DmNotification["type"], React.ReactNode> = {
    success: <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />,
    info: <InfoIcon sx={{ fontSize: 18, color: "#2563eb" }} />,
    warning: <WarningAmberIcon sx={{ fontSize: 18, color: "#ea580c" }} />,
    purple: <AssignmentIcon sx={{ fontSize: 18, color: "#7c3aed" }} />,
};

const BG_MAP: Record<DmNotification["type"], string> = {
    success: "#dcfce7",
    info: "#dbeafe",
    warning: "#ffedd5",
    purple: "#ede9fe",
};

type NotificationsCardProps = {
    notifications: DmNotification[];
};

export default function NotificationsCard({ notifications }: NotificationsCardProps) {
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
            <CardContent sx={{ p: "20px !important" }}>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "15px" }}>
                        Recent Notifications
                    </Typography>
                    <Button
                        variant="text"
                        size="small"
                        sx={{ fontSize: "12px", fontWeight: 700, color: "#2563eb", textTransform: "none", p: 0, minWidth: 0 }}
                    >
                        View All
                    </Button>
                </Box>

                {/* Notification list */}
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {notifications.map((n, idx) => (
                        <Box key={n.id}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 1.2,
                                    py: 1.4,
                                    cursor: "pointer",
                                    borderRadius: "8px",
                                    px: 0.5,
                                    transition: "background 0.15s",
                                    "&:hover": { background: "#f8fafc" },
                                }}
                            >
                                {/* Icon bubble */}
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        background: BG_MAP[n.type],
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {ICON_MAP[n.type]}
                                </Box>

                                {/* Text */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: "12.5px",
                                            fontWeight: 600,
                                            color: "#1f2937",
                                            lineHeight: 1.4,
                                            whiteSpace: "normal",
                                        }}
                                    >
                                        {n.message}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "11px", mt: 0.3, display: "block" }}>
                                        {n.time}
                                    </Typography>
                                </Box>

                                {/* Chevron */}
                                <ChevronRightIcon sx={{ fontSize: 16, color: "#cbd5e1", flexShrink: 0, mt: 0.3 }} />
                            </Box>
                            {idx < notifications.length - 1 && <Divider sx={{ borderColor: "#f1f5f9" }} />}
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}
