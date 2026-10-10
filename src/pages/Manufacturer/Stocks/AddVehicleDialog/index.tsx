import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";

type AddVehicleDialogProps = {
  open: boolean;
  name: string;
  variant: string;
  color: string;
  quantity: string;
  image: File | null;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onNameChange: (value: string) => void;
  onVariantChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
};

export default function AddVehicleDialog(props: AddVehicleDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle className="add-stock-dialog-title">
        Add Vehicle
        <IconButton onClick={props.onClose} aria-label="Close add vehicle form"><CloseIcon /></IconButton>
      </DialogTitle>
      <form onSubmit={props.onSubmit}>
        <DialogContent className="add-stock-dialog-content">
          <label><span>Model Name</span><input value={props.name} onChange={(event) => props.onNameChange(event.target.value)} required /></label>
          <label><span>Variant</span><input value={props.variant} onChange={(event) => props.onVariantChange(event.target.value)} required /></label>
          <label><span>Colour</span><input value={props.color} onChange={(event) => props.onColorChange(event.target.value)} required /></label>
          <label><span>Quantity</span><input type="number" min="1" step="1" value={props.quantity} onChange={(event) => props.onQuantityChange(event.target.value)} required /></label>
          <label><span>Vehicle Image</span><input type="file" accept="image/*" onChange={(event) => props.onImageChange(event.target.files?.[0] ?? null)} required /></label>
        </DialogContent>
        <div className="add-stock-dialog-actions">
          <button type="button" className="add-stock-cancel" onClick={props.onClose}>Cancel</button>
          <button type="submit" className="add-stock-submit">Add Vehicle</button>
        </div>
      </form>
    </Dialog>
  );
}
