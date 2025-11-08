import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

export interface PropertySnapshot {
  iteration: number;
  agent: string;
  LogP?: number;
  TPSA?: number;
  QED?: number;
  MW?: number;
  "SA Score"?: number;
  Tanimoto?: number;
}

interface PropertyEvolutionChartProps {
  snapshots: PropertySnapshot[];
}

export const PropertyEvolutionChart = ({ snapshots }: PropertyEvolutionChartProps) => {
  if (snapshots.length === 0) return null;

  // Determine which properties are present
  const availableProperties = new Set<string>();
  snapshots.forEach(snapshot => {
    Object.keys(snapshot).forEach(key => {
      if (key !== 'iteration' && key !== 'agent') {
        availableProperties.add(key);
      }
    });
  });

  const propertyColors: Record<string, string> = {
    LogP: "#8b5cf6",
    TPSA: "#3b82f6",
    QED: "#10b981",
    MW: "#f59e0b",
    "SA Score": "#ef4444",
    Tanimoto: "#06b6d4",
  };

  const propertyDescriptions: Record<string, string> = {
    LogP: "Lipophilicity (lower is more hydrophilic)",
    TPSA: "Polar Surface Area (affects permeability)",
    QED: "Drug-likeness Score (higher is better)",
    MW: "Molecular Weight",
    "SA Score": "Synthetic Accessibility (lower is easier)",
    Tanimoto: "Structural Similarity (higher preserves structure)",
  };

  return (
    <Card className="p-6 border-border shadow-medium animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Property Evolution</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track how molecular properties change through optimization iterations
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from(availableProperties).map((prop) => (
            <Badge
              key={prop}
              variant="outline"
              className="text-xs"
              style={{ borderColor: propertyColors[prop], color: propertyColors[prop] }}
            >
              <span
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: propertyColors[prop] }}
              />
              {prop}: {propertyDescriptions[prop]}
            </Badge>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={snapshots} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="iteration"
              label={{ value: "Iteration", position: "insideBottom", offset: -5 }}
              className="text-xs"
            />
            <YAxis
              label={{ value: "Property Value", angle: -90, position: "insideLeft" }}
              className="text-xs"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "10px" }}
              iconType="line"
            />
            {Array.from(availableProperties).map((prop) => (
              <Line
                key={prop}
                type="monotone"
                dataKey={prop}
                stroke={propertyColors[prop]}
                strokeWidth={2}
                dot={{ fill: propertyColors[prop], r: 4 }}
                activeDot={{ r: 6 }}
                name={prop}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
