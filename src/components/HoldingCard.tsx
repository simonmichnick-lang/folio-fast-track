import { Holding } from "@/types/portfolio";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface HoldingCardProps {
  holding: Holding;
  onEdit: (holding: Holding) => void;
  onDelete: (id: string) => void;
}

export const HoldingCard = ({ holding, onEdit, onDelete }: HoldingCardProps) => {
  const currentValue = holding.quantity * holding.currentPrice;
  const totalCost = holding.quantity * holding.purchasePrice;
  const gainLoss = currentValue - totalCost;
  const gainLossPercent = ((currentValue - totalCost) / totalCost) * 100;
  
  const isGain = gainLoss >= 0;

  return (
    <Card className="bg-gradient-to-br from-card via-card to-muted/20 hover:shadow-lg transition-all duration-300 border-muted/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg tracking-tight">{holding.symbol}</h3>
            <p className="text-sm text-muted-foreground truncate max-w-[150px]">{holding.name}</p>
          </div>
          <Badge variant={isGain ? "default" : "destructive"} className="flex items-center gap-1">
            {isGain ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isGain ? "+" : ""}{gainLossPercent.toFixed(2)}%
          </Badge>
        </div>
        
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(holding)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(holding.id)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Quantity</p>
            <p className="font-medium">{holding.quantity.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="font-medium">${holding.currentPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Purchase Price</p>
            <p className="font-medium">${holding.purchasePrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="font-medium">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <div className="pt-2 border-t border-muted/30">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total P&L</span>
            <div className="text-right">
              <p className={cn(
                "font-semibold",
                isGain ? "text-gain" : "text-loss"
              )}>
                {isGain ? "+" : ""}${Math.abs(gainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">
                Cost: ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
