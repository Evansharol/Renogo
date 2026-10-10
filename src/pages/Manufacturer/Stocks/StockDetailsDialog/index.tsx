import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import type { VehicleStock } from "../types"

type StockDetailsDialogProps = {
  vehicle: VehicleStock | null;
  editing: boolean;
  editName: string;
  editQuantity: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (event: React.FormEvent<HTMLFormElement>) => void;
  onEditNameChange: (value: string) => void;
  onEditQuantityChange: (value: string) => void;
  onCancelEdit: () => void;
};

export default function StockDetailsDialog(props: StockDetailsDialogProps) {
  const vehicle = props.vehicle;
  return (
    <Dialog open={Boolean(vehicle)} onClose={props.onClose} fullWidth maxWidth="sm" aria-labelledby="stock-details-title">
      {vehicle && (
        <>
          <DialogTitle id="stock-details-title" className="stock-dialog-title">
            <div><strong>{vehicle.name}</strong><span>{vehicle.category} · {vehicle.fuelType} · {vehicle.transmission}</span></div>
            <div className="stock-dialog-actions">
              <IconButton onClick={props.onEdit} aria-label="Edit vehicle stock"><EditOutlinedIcon /></IconButton>
              <IconButton onClick={props.onDelete} aria-label="Delete vehicle stock"><DeleteOutlineIcon /></IconButton>
              <IconButton onClick={props.onClose} aria-label="Close vehicle details"><CloseIcon /></IconButton>
            </div>
          </DialogTitle>
          {props.editing ? (
            <form onSubmit={props.onSave}>
              <DialogContent className="stock-dialog-content stock-edit-form">
                <label><span>Vehicle Name</span><input value={props.editName} onChange={(event) => props.onEditNameChange(event.target.value)} required /></label>
                <label><span>Total Quantity</span><input type="number" min="0" step="1" value={props.editQuantity} onChange={(event) => props.onEditQuantityChange(event.target.value)} required /></label>
              </DialogContent>
              <div className="add-stock-dialog-actions">
                <button type="button" className="add-stock-cancel" onClick={props.onCancelEdit}>Cancel</button>
                <button type="submit" className="add-stock-submit">Save Changes</button>
              </div>
            </form>
          ) : (
            <DialogContent className="stock-dialog-content">
              <div className="stock-dialog-image">{vehicle.image && <img src={vehicle.image} alt={vehicle.name} />}</div>
              <div className="stock-dialog-summary"><span>Total Available Quantity</span><strong>{vehicle.quantity} Units</strong></div>
              <h3>Quantity by Colour</h3>
              <div className="stock-colour-list">{vehicle.colors.map((color) => <div className="stock-colour-row" key={`${color.name}-${color.quantity}`}><span><i className={`stock-colour-dot ${color.colorClass ?? ""}`} />{color.name}</span><strong>{color.quantity} Units</strong></div>)}</div>
              <div className="stock-dialog-variants"><span>Variants</span><strong>{vehicle.variants.join(", ")}</strong></div>
            </DialogContent>
          )}
        </>
      )}
    </Dialog>
  );
}
