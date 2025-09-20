import { PortfolioSummary as PortfolioSummaryType } from "@/types/portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
  holdingsCount: number;
}

export const PortfolioSummary = ({ summary, holdingsCount }: PortfolioSummaryProps) => {
  const isGain = summary.totalGainLoss >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            Total cost: ${summary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card className={cn(
        "bg-gradient-to-br from-card via-card border-opacity-20",
        isGain 
          ? "to-gain/5 border-gain/20" 
          : "to-loss/5 border-loss/20"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          {isGain ? 
            <TrendingUp className="h-4 w-4 text-gain" /> : 
            <TrendingDown className="h-4 w-4 text-loss" />
          }
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            isGain ? "text-gain" : "text-loss"
          )}>
            {isGain ? "+" : ""}${Math.abs(summary.totalGainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className={cn(
            "text-xs font-medium",
            isGain ? "text-gain" : "text-loss"
          )}>
            {isGain ? "+" : ""}{summary.totalGainLossPercent.toFixed(2)}% overall
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card via-card to-accent/5 border-accent/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Holdings</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{holdingsCount}</div>
          <p className="text-xs text-muted-foreground">
            Active positions
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card via-card to-secondary/5 border-secondary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Return</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            isGain ? "text-gain" : "text-loss"
          )}>
            {summary.totalGainLossPercent.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Portfolio performance
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
