import { useState, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

interface UploadPaymentProofModalProps {
    open: boolean;
    onClose: () => void;
    requestId: string;
    defaultAmount?: string;
    onSuccess?: (details: { utr: string; amount: string; fileName: string; imageUrl?: string }) => Promise<void> | void;
}

export default function UploadPaymentProofModal({
    open,
    onClose,
    requestId,
    defaultAmount,
    onSuccess,
}: UploadPaymentProofModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [utrNumber, setUtrNumber] = useState("");
    const [amount, setAmount] = useState(defaultAmount ?? "");
    const [paymentMode, setPaymentMode] = useState("RTGS");
    const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [notes, setNotes] = useState("");

    const [dragActive, setDragActive] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        // Check if file is image or pdf
        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
            setErrorMsg("Please upload a valid image file (PNG, JPG, WEBP) or PDF receipt.");
            return;
        }

        setErrorMsg("");
        setSelectedFile(file);

        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null); // PDF, no direct image preview
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setErrorMsg("Please upload a payment proof image or counterfoil.");
            return;
        }
        if (!utrNumber.trim()) {
            setErrorMsg("Please enter the Bank UTR / Transaction Reference Number.");
            return;
        }

        setErrorMsg("");
        setSubmitting(true);
        try {
            await onSuccess?.({
                utr: utrNumber,
                amount,
                fileName: selectedFile.name,
                imageUrl: previewUrl || undefined,
            });
            setSubmitted(true);
            setTimeout(() => {
                handleReset();
                onClose();
            }, 1600);
        } catch (error) {
            setErrorMsg(error instanceof Error ? error.message : "Unable to submit payment proof.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUtrNumber("");
        setErrorMsg("");
        setSubmitted(false);
        setSubmitting(false);
    };

    const handleModalClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleModalClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
                    },
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 3,
                    py: 2.2,
                    backgroundColor: "#0f2b5c",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 22, color: "#ffffff" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: "17px", lineHeight: 1.2 }}>
                            Upload Payment Proof
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", mt: 0.3 }}>
                            Submit bank counterfoil or payment receipt • Ref: <strong>{requestId}</strong>
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={handleModalClose}
                    size="small"
                    sx={{
                        color: "rgba(255, 255, 255, 0.8)",
                        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)", color: "#ffffff" },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Content */}
            <DialogContent sx={{ p: 3, backgroundColor: "#f8fafc" }}>
                {submitted ? (
                    <Box sx={{ py: 5, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "#16a34a", mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
                            Payment Proof Submitted Successfully!
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#64748b", maxWidth: 360 }}>
                            UTR <strong>{utrNumber}</strong> and receipt image have been forwarded to the finance department for verification.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
                        {errorMsg && (
                            <Alert severity="error" sx={{ fontSize: "12.5px" }}>
                                {errorMsg}
                            </Alert>
                        )}

                        {/* Hidden native input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handleFileChange(e.target.files[0]);
                                }
                            }}
                        />

                        {/* Upload Image Dropzone / Preview */}
                        {!selectedFile ? (
                            <Box
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                    border: "2px dashed",
                                    borderColor: dragActive ? "#2563eb" : "#cbd5e1",
                                    backgroundColor: dragActive ? "#eff6ff" : "#ffffff",
                                    borderRadius: "14px",
                                    p: 3.5,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        borderColor: "#2563eb",
                                        backgroundColor: "#f8fafc",
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: "50%",
                                        backgroundColor: "#eff6ff",
                                        color: "#2563eb",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mx: "auto",
                                        mb: 1.5,
                                    }}
                                >
                                    <ImageIcon sx={{ fontSize: 26 }} />
                                </Box>
                                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                                    Click to upload receipt image, or drag &amp; drop
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                                    Supports PNG, JPG, JPEG, WEBP or PDF (Max 10 MB)
                                </Typography>
                            </Box>
                        ) : (
                            /* File Preview Box */
                            <Box
                                sx={{
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    p: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    {previewUrl ? (
                                        <Box
                                            component="img"
                                            src={previewUrl}
                                            alt="Payment proof preview"
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                objectFit: "cover",
                                                borderRadius: "8px",
                                                border: "1px solid #e2e8f0",
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: "8px",
                                                backgroundColor: "#f1f5f9",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#64748b",
                                            }}
                                        >
                                            <InsertDriveFileOutlinedIcon sx={{ fontSize: 32 }} />
                                        </Box>
                                    )}

                                    <Box>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                                            {selectedFile.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11.5px", color: "#64748b" }}>
                                            {(selectedFile.size / 1024).toFixed(1)} KB • Image Loaded
                                        </Typography>
                                        <Typography
                                            onClick={() => fileInputRef.current?.click()}
                                            sx={{
                                                fontSize: "11.5px",
                                                color: "#2563eb",
                                                fontWeight: 700,
                                                cursor: "pointer",
                                                mt: 0.5,
                                                "&:hover": { textDecoration: "underline" },
                                            }}
                                        >
                                            Change image
                                        </Typography>
                                    </Box>
                                </Box>

                                <IconButton
                                    onClick={handleRemoveFile}
                                    size="small"
                                    sx={{
                                        color: "#ef4444",
                                        border: "1px solid #fecaca",
                                        borderRadius: "8px",
                                        "&:hover": { backgroundColor: "#fee2e2" },
                                    }}
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        )}

                        {/* Transaction Metadata Fields */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                gap: 1.8,
                            }}
                        >
                            <TextField
                                label="UTR / Bank Transaction No. *"
                                placeholder="e.g. UTR9847291837"
                                size="small"
                                fullWidth
                                value={utrNumber}
                                onChange={(e) => setUtrNumber(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": { backgroundColor: "#ffffff", borderRadius: "8px", fontSize: "13px" },
                                    "& .MuiInputLabel-root": { fontSize: "12.5px" },
                                }}
                            />

                            <TextField
                                label="Amount Paid (₹) *"
                                size="small"
                                fullWidth
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": { backgroundColor: "#ffffff", borderRadius: "8px", fontSize: "13px" },
                                    "& .MuiInputLabel-root": { fontSize: "12.5px" },
                                }}
                            />

                            <TextField
                                select
                                label="Payment Mode"
                                size="small"
                                fullWidth
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": { backgroundColor: "#ffffff", borderRadius: "8px", fontSize: "13px" },
                                    "& .MuiInputLabel-root": { fontSize: "12.5px" },
                                }}
                            >
                                <MenuItem value="RTGS">RTGS</MenuItem>
                                <MenuItem value="NEFT">NEFT</MenuItem>
                                <MenuItem value="IMPS">IMPS</MenuItem>
                                <MenuItem value="Net Banking">Net Banking</MenuItem>
                            </TextField>

                            <TextField
                                type="date"
                                label="Payment Date"
                                size="small"
                                fullWidth
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={{
                                    "& .MuiOutlinedInput-root": { backgroundColor: "#ffffff", borderRadius: "8px", fontSize: "13px" },
                                    "& .MuiInputLabel-root": { fontSize: "12.5px" },
                                }}
                            />
                        </Box>

                        <TextField
                            label="Additional Notes / Remarks (Optional)"
                            placeholder="Add reference notes or branch details..."
                            size="small"
                            fullWidth
                            multiline
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": { backgroundColor: "#ffffff", borderRadius: "8px", fontSize: "13px" },
                                "& .MuiInputLabel-root": { fontSize: "12.5px" },
                            }}
                        />

                        {/* Footer Buttons */}
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={handleModalClose}
                                disabled={submitting}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "12.5px",
                                    borderRadius: "8px",
                                    px: 2.5,
                                    color: "#64748b",
                                    borderColor: "#cbd5e1",
                                    "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f8fafc" },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                loading={submitting}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "12.5px",
                                    borderRadius: "8px",
                                    px: 3,
                                    backgroundColor: "#0f2b5c",
                                    "&:hover": { backgroundColor: "#1e3a8a" },
                                }}
                            >
                                {submitting ? "Submitting Proof..." : "Submit Payment Proof"}
                            </Button>
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}
