import { useState, useEffect } from "react";
import { Holding, PortfolioSummary as PortfolioSummaryType } from "@/types/portfolio";
import { HoldingCard } from "@/components/HoldingCard";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { AddHoldingDialog } from "@/components/AddHoldingDialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "portfolio-holdings";

export default function Portfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedHoldings = localStorage.getItem(STORAGE_KEY);
    if (savedHoldings) {
      setHoldings(JSON.parse(savedHoldings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
  }, [holdings]);

  const addHolding = (holdingData: Omit<Holding, "id">) => {
    const newHolding: Holding = {
      ...holdingData,
      id: crypto.randomUUID()
    };
    setHoldings([...holdings, newHolding]);
  };

  const updateHolding = (updatedHolding: Holding) => {
    setHoldings(holdings.map(h => h.id === updatedHolding.id ? updatedHolding : h));
    setEditingHolding(null);
  };

  const deleteHolding = (id: string) => {
    setHoldings(holdings.filter(h => h.id !== id));
    toast({
      title: "Holding Removed",
      description: "The holding has been removed from your portfolio"
    });
  };

  const calculateSummary = (): PortfolioSummaryType => {
    const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.quantity * h.purchasePrice), 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent
    };
  };

  const refreshPrices = () => {
    toast({
      title: "Prices Refreshed",
      description: "In a real app, this would fetch current market prices"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Portfolio Tracker
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your investments and monitor performance offline
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={refreshPrices}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Prices
            </Button>
            <AddHoldingDialog
              onAddHolding={addHolding}
              editingHolding={editingHolding}
              onUpdateHolding={updateHolding}
              onClose={() => setEditingHolding(null)}
            />
          </div>
        </div>

        {holdings.length > 0 && (
          <div className="mb-8">
            <PortfolioSummary summary={calculateSummary()} holdingsCount={holdings.length} />
          </div>
        )}

        {holdings.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Holdings Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start building your portfolio by adding your first holding. Track stocks, ETFs, and other securities.
            </p>
            <AddHoldingDialog onAddHolding={addHolding} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Holdings</h2>
              <p className="text-sm text-muted-foreground">
                {holdings.length} position{holdings.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {holdings.map((holding) => (
                <HoldingCard
                  key={holding.id}
                  holding={holding}
                  onEdit={setEditingHolding}
                  onDelete={deleteHolding}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}