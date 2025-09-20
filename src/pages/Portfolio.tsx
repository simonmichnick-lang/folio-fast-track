import { useState, useEffect } from "react";
import { Holding, PortfolioSummary as PortfolioSummaryType } from "@/types/portfolio";
import { HoldingCard } from "@/components/HoldingCard";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { AddHoldingDialog } from "@/components/AddHoldingDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RefreshCw, BarChart3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Portfolio page for tracking investment holdings.
 *
 * Enhancements over the base template:
 * - Search bar to filter holdings by symbol or name.
 * - Sort dropdown to sort holdings by symbol, name or gain/loss.
 * - Pie chart showing portfolio allocation by market value.
 */

const STORAGE_KEY = "portfolio-holdings";

export default function Portfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const { toast } = useToast();

  // New UI state: search query and sort key
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<"symbol" | "name" | "gain">("symbol");

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
      id: crypto.randomUUID(),
    };
    setHoldings([...holdings, newHolding]);
  };

  const updateHolding = (updated: Holding) => {
    setHoldings(holdings.map((h) => (h.id === updated.id ? updated : h)));
    setEditingHolding(null);
  };

  const deleteHolding = (id: string) => {
    setHoldings(holdings.filter((h) => h.id !== id));
    toast({
      title: "Holding Removed",
      description: "The holding has been removed from your portfolio",
    });
  };

  const calculateSummary = (): PortfolioSummaryType => {
    const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.quantity * h.purchasePrice, 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
    };
  };

  const refreshPrices = () => {
    toast({
      title: "Prices Refreshed",
      description: "In a real app, this would fetch current market prices",
    });
  };

  // Derived data: filter and sort holdings based on UI controls
  const filteredHoldings = holdings.filter((h) =>
    h.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    if (sortKey === "symbol") return a.symbol.localeCompare(b.symbol);
    if (sortKey === "name") return a.name.localeCompare(b.name);
    // sort by gain/loss descending
    const gainA = a.quantity * a.currentPrice - a.quantity * a.purchasePrice;
    const gainB = b.quantity * b.currentPrice - b.quantity * b.purchasePrice;
    return gainB - gainA;
  });

  // Chart data for portfolio allocation (by current market value)
  const chartData = filteredHoldings.map((h) => ({
    name: h.symbol,
    value: h.quantity * h.currentPrice,
  }));
  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
    "#ff9a9e",
    "#a4de6c",
    "#d0ed57",
    "#ffa07a",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header with actions and controls */}
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

        {/* Search and sort controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <Input
            placeholder="Search by symbol or name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-64"
          />
          <Select
            value={sortKey}
            onValueChange={(value) => setSortKey(value as "symbol" | "name" | "gain")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="symbol">Symbol</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="gain">Gain/Loss</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary and chart */}
        {holdings.length > 0 && (
          <>
            <div className="mb-8">
              <PortfolioSummary
                summary={calculateSummary()}
                holdingsCount={holdings.length}
              />
            </div>
            <div className="mb-8">
              <div className="p-4 rounded-md border bg-card shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Portfolio Allocation</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Holdings list or empty state */}
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
                {filteredHoldings.length} position
                {filteredHoldings.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sortedHoldings.map((holding) => (
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
