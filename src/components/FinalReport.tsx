import { Card } from "@/components/ui/card";
import { MoleculeVisualization } from "./MoleculeVisualization";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FinalReportProps {
  report: {
    executive_summary: string;
    final_smiles: string;
    verifiable_data: Record<string, any>;
  };
}

interface PropertyRange {
  optimal: [number, number];
  acceptable: [number, number];
}

const propertyRanges: Record<string, PropertyRange> = {
  "LogP": { optimal: [0, 3], acceptable: [-0.4, 5.6] },
  "logP": { optimal: [0, 3], acceptable: [-0.4, 5.6] },
  "TPSA": { optimal: [20, 90], acceptable: [0, 140] },
  "QED": { optimal: [0.67, 1], acceptable: [0.49, 1] },
  "SA_Score": { optimal: [1, 3], acceptable: [1, 6] },
  "Tanimoto": { optimal: [0.7, 0.95], acceptable: [0.5, 1] },
  "MW": { optimal: [160, 450], acceptable: [150, 500] },
};

type RangeStatus = "optimal" | "acceptable" | "problematic";

const getValueStatus = (property: string, value: number): RangeStatus => {
  const range = propertyRanges[property];
  if (!range) return "acceptable";

  const isInOptimal = value >= range.optimal[0] && value <= range.optimal[1];
  const isInAcceptable = value >= range.acceptable[0] && value <= range.acceptable[1];

  if (isInOptimal) return "optimal";
  if (isInAcceptable) return "acceptable";
  return "problematic";
};

const PropertyBadge = ({ property, value }: { property: string; value: number }) => {
  const status = getValueStatus(property, value);
  
  const configs = {
    optimal: {
      icon: CheckCircle2,
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-800",
      label: "Rango óptimo"
    },
    acceptable: {
      icon: AlertTriangle,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800",
      label: "Rango aceptable"
    },
    problematic: {
      icon: XCircle,
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800",
      label: "Requiere atención"
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${config.className} gap-1.5 font-mono`}>
            <Icon className="h-3.5 w-3.5" />
            {value.toFixed(2)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-medium">{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const FinalReport = ({ report }: FinalReportProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4 pt-6 border-t-2 border-accent/20 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-accent/10 border-2 border-accent rounded-lg p-2">
          <CheckCircle2 className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Research Complete!</h3>
          <p className="text-sm text-muted-foreground">Collective Insight Report</p>
        </div>
      </div>

      <Card className="p-6 bg-accent/5 border-accent/20 shadow-medium">
        <h4 className="font-semibold text-foreground mb-3">Executive Summary</h4>
        <div className="prose prose-sm max-w-none text-foreground/90">
          {report.executive_summary.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2 leading-relaxed">{paragraph}</p>
          ))}
        </div>
      </Card>

      <div>
        <h4 className="font-semibold text-foreground mb-3">Final Optimized Molecule</h4>
        <MoleculeVisualization smiles={report.final_smiles} />
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between hover:bg-muted"
          >
            <span>Show Verifiable Sources</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <Card className="p-4 bg-muted/30 border-border space-y-4">
            {Object.entries(report.verifiable_data).length > 0 && (
              <div className="space-y-3">
                <h5 className="font-semibold text-sm text-foreground">Propiedades Moleculares</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(report.verifiable_data).map(([key, value]) => {
                    const numValue = typeof value === 'number' ? value : parseFloat(value);
                    const hasRange = propertyRanges[key] !== undefined;
                    
                    return (
                      <div key={key} className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border">
                        <span className="text-sm font-medium text-foreground">{key}</span>
                        {hasRange && !isNaN(numValue) ? (
                          <PropertyBadge property={key} value={numValue} />
                        ) : (
                          <Badge variant="outline" className="font-mono">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Ver datos en formato JSON
              </summary>
              <pre className="mt-3 text-xs font-mono text-foreground/80 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(report.verifiable_data, null, 2)}
              </pre>
            </details>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
