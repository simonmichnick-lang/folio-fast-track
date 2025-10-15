import { format } from "date-fns";
import { HoldingSchema, type HoldingInput } from "@/lib/validation/holding";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AddHoldingDialogProps {
  onAddHolding: (holding: Omit<Holding, "id">) => void;
  editingHolding?: Holding | null;
  onUpdateHolding?: (holding: Holding) => void;
  onClose?: () => void;
}

export const AddHoldingDialog = ({ 
  onAddHolding, 
  editingHolding, 
  onUpdateHolding, 
  onClose 
}: AddHoldingDialogProps) => {
  const [open, setOpen] = useState(false);

  // Form state for the dialog
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    quantity: "",
    purchasePrice: "",
    currentPrice: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (editingHolding) {
      setFormData({
        symbol: editingHolding.symbol,
        name: editingHolding.name,
        quantity: editingHolding.quantity.toString(),
        purchasePrice: editingHolding.purchasePrice.toString(),
        currentPrice: editingHolding.currentPrice.toString(),
        purchaseDate: editingHolding.purchaseDate,
      });
      setOpen(true);
    }
  }, [editingHolding]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.quantity || !formData.purchasePrice || !formData.currentPrice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const holdingData = {
      symbol: formData.symbol.toUpperCase(),
      name: formData.name || formData.symbol.toUpperCase(),
      quantity: parseFloat(formData.quantity),
      purchasePrice: parseFloat(formData.purchasePrice),
      currentPrice: parseFloat(formData.currentPrice),
      purchaseDate: formData.purchaseDate,
    };

    if (editingHolding && onUpdateHolding) {
      onUpdateHolding({ ...holdingData, id: editingHolding.id });
    } else {
      onAddHolding(holdingData);
    }

    setFormData({
      symbol: "",
      name: "",
      quantity: "",
      purchasePrice: "",
      currentPrice: "",
      purchaseDate: new Date().toISOString().split("T")[0],
    });
    
    setOpen(false);
    onClose?.();

    toast({
      title: "Success",
      description: editingHolding ? "Holding updated successfully" : "Holding added successfully"
    });
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) onClose?.();
    }}>
      <DialogTrigger asChild>
        {!editingHolding && (
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Plus className="mr-2 h-4 w-4" />
            Add Holding
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingHolding ? "Edit Holding" : "Add New Holding"}</DialogTitle>
          <DialogDescription>
            {editingHolding ? "Update the details of your existing holding." : "Enter the details of your new investment holding."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="AAPL"
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.001"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="100"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Apple Inc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price *</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="150.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPrice">Current Price *</Label>
              <Input
                id="currentPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                placeholder="175.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            {editingHolding ? "Update Holding" : "Add Holding"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
