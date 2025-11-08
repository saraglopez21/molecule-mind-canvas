import { Card } from "@/components/ui/card";
import { MoleculeVisualization } from "./MoleculeVisualization";
import { useState, useEffect } from "react";
import { Bot, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface AgentMessageProps {
  thought: {
    agent: string;
    message: string;
    timestamp?: number;
  };
}

const agentColors: Record<string, string> = {
  Designer: "bg-primary/10 border-primary/20 text-primary",
  Validator: "bg-secondary/10 border-secondary/20 text-secondary",
  Synthesizer: "bg-accent/10 border-accent/20 text-accent",
};

const chemicalTerms: Record<string, string> = {
  LogP: "Octanol-water partition coefficient. Measures molecular lipophilicity (how soluble it is in fat vs water). Typical values: -2 to 6.",
  logP: "Octanol-water partition coefficient. Measures molecular lipophilicity (how soluble it is in fat vs water). Typical values: -2 to 6.",
  TPSA: "Topological Polar Surface Area. Predicts cell membrane permeability. Low values (<140 Ų) favor oral absorption.",
  QED: "Quantitative Estimate of Drug-likeness. Metric evaluating how similar the molecule is to a typical drug. Scale: 0 (not drug-like) to 1 (very drug-like).",
  "SA Score":
    "Synthetic Accessibility Score. Estimates how easy it is to synthesize the molecule in the laboratory. Scale: 1 (very easy) to 10 (very difficult).",
  Tanimoto:
    "Molecular similarity measure based on chemical fingerprints. Compares chemical structures. Scale: 0 (completely different) to 1 (identical).",
  Lipinski:
    "Lipinski's Rule of 5. Criteria to predict oral bioavailability: MW<500, LogP<5, HBD<5, HBA<10.",
  bioavailability:
    "Bioavailability. Fraction of the drug that reaches systemic circulation unchanged. Critical for oral drugs.",
  permeability:
    "Permeability. Ability of a molecule to cross biological membranes. Essential for absorption and distribution.",
  solubility:
    "Solubility. Ability to dissolve in a solvent. Affects drug absorption and bioavailability.",
  toxicity:
    "Toxicity. Potential of a substance to cause harm to living organisms. Evaluated at multiple levels.",
  affinity:
    "Affinity. Binding strength between a molecule (ligand) and its biological target (receptor). Measured by Kd or IC50.",
  selectivity:
    "Selectivity. Preference of a molecule for a specific target over others. Reduces side effects.",
  ADME: "Absorption, Distribution, Metabolism, and Excretion. Pharmacokinetic properties that determine drug behavior in the body.",
  MW: "Molecular Weight. Total mass of the molecule. Important for drug absorption and distribution.",
  CNS: "Central Nervous System. Ability to penetrate the blood-brain barrier.",
  HBD: "Hydrogen Bond Donors. Number of hydrogen atoms bound to electronegative atoms that can donate hydrogen bonds.",
  HBA: "Hydrogen Bond Acceptors. Number of electronegative atoms that can accept hydrogen bonds.",
};

interface PropertyRange {
  optimal: [number, number];
  acceptable: [number, number];
  reverse?: boolean; // true si valores más bajos son mejores
}

const propertyRanges: Record<string, PropertyRange> = {
  LogP: { optimal: [0, 3], acceptable: [-0.4, 5.6] },
  logP: { optimal: [0, 3], acceptable: [-0.4, 5.6] },
  TPSA: { optimal: [20, 90], acceptable: [0, 140], reverse: true },
  QED: { optimal: [0.67, 1], acceptable: [0.49, 1] },
  "SA Score": { optimal: [1, 3], acceptable: [1, 6], reverse: true },
  Tanimoto: { optimal: [0.7, 0.95], acceptable: [0.5, 1] },
  MW: { optimal: [160, 450], acceptable: [150, 500], reverse: true },
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

const StatusIndicator = ({ status, value }: { status: RangeStatus; value: string }) => {
  const configs = {
    optimal: {
      icon: CheckCircle2,
      className: "text-green-600 dark:text-green-400",
      badgeVariant: "default" as const,
      badgeClassName:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-800",
      label: "Optimal",
    },
    acceptable: {
      icon: AlertTriangle,
      className: "text-yellow-600 dark:text-yellow-400",
      badgeVariant: "secondary" as const,
      badgeClassName:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800",
      label: "Acceptable",
    },
    problematic: {
      icon: XCircle,
      className: "text-red-600 dark:text-red-400",
      badgeVariant: "destructive" as const,
      badgeClassName: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800",
      label: "Problematic",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={config.badgeVariant}
            className={`${config.badgeClassName} ml-1.5 gap-1 text-xs font-semibold`}
          >
            <Icon className="h-3 w-3" />
            {value}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-medium">{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const extractSmilesStrings = (text: string): string[] => {
  const smilesPatterns = [
    /`([A-Za-z0-9@+\-\[\]\(\)=#$\/\\%]+)`/g,
    /SMILES[:\s]+([A-Za-z0-9@+\-\[\]\(\)=#$\/\\%]+)/gi,
    /molecule[:\s]+([A-Za-z0-9@+\-\[\]\(\)=#$\/\\%]+)/gi,
  ];

  const found: string[] = [];

  for (const pattern of smilesPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const potential = match[1];
      if (potential && potential.length > 5 && /[A-Z]/.test(potential)) {
        found.push(potential);
      }
    }
  }

  return [...new Set(found)];
};

const renderMessageWithTooltips = (text: string) => {
  const parts: JSX.Element[] = [];
  let lastIndex = 0;
  let key = 0;

  // Pattern to match property: value pairs (e.g., "LogP: 2.3", "TPSA = 45.2")
  const propertyValuePattern = new RegExp(
    `\\b(${Object.keys(propertyRanges).join("|")})\\s*[:=]?\\s*(-?\\d+\\.?\\d*)`,
    "gi",
  );

  // Create a regex pattern from all chemical terms
  const termPattern = new RegExp(`\\b(${Object.keys(chemicalTerms).join("|")})\\b`, "gi");

  // First pass: find all matches (both property-value pairs and terms)
  const allMatches: Array<{ index: number; length: number; type: "property-value" | "term"; match: RegExpExecArray }> =
    [];

  let match;
  while ((match = propertyValuePattern.exec(text)) !== null) {
    allMatches.push({ index: match.index, length: match[0].length, type: "property-value", match });
  }

  while ((match = termPattern.exec(text)) !== null) {
    // Check if this term is part of a property-value pair
    const isPartOfPropertyValue = allMatches.some(
      (m) => m.type === "property-value" && match.index >= m.index && match.index < m.index + m.length,
    );
    if (!isPartOfPropertyValue) {
      allMatches.push({ index: match.index, length: match[0].length, type: "term", match });
    }
  }

  // Sort matches by index
  allMatches.sort((a, b) => a.index - b.index);

  // Second pass: render matches
  for (const { index, length, type, match } of allMatches) {
    // Add text before the match
    if (index > lastIndex) {
      parts.push(<span key={`text-${key++}`}>{text.substring(lastIndex, index)}</span>);
    }

    if (type === "property-value") {
      const property = match[1];
      const value = parseFloat(match[2]);
      const status = getValueStatus(property, value);

      parts.push(
        <span key={`prop-${key++}`} className="inline-flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="underline decoration-dotted decoration-primary/50 cursor-help">{property}</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{chemicalTerms[property] || "Propiedad química"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {text[index + property.length] === ":" || text[index + property.length] === "="
            ? text[index + property.length]
            : ""}{" "}
          <StatusIndicator status={status} value={match[2]} />
        </span>,
      );
    } else {
      // Add term with tooltip
      const term = match[0];
      const termKey = Object.keys(chemicalTerms).find((k) => k.toLowerCase() === term.toLowerCase());

      if (termKey) {
        parts.push(
          <TooltipProvider key={`tooltip-${key++}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="underline decoration-dotted decoration-primary/50 cursor-help">{term}</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{chemicalTerms[termKey]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        );
      }
    }

    lastIndex = index + length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${key++}`}>{text.substring(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
};

export const AgentMessage = ({ thought }: AgentMessageProps) => {
  const [smilesStrings, setSmilesStrings] = useState<string[]>([]);
  const agentColor = agentColors[thought.agent] || "bg-muted border-muted text-muted-foreground";

  useEffect(() => {
    const smiles = extractSmilesStrings(thought.message);
    if (smiles.length > 0) {
      setSmilesStrings(smiles);
    }
  }, [thought.message]);

  return (
    <Card className="p-4 border-border shadow-soft animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 border ${agentColor}`}>
          <Bot className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="font-semibold text-sm text-foreground">{thought.agent}</p>
            {thought.timestamp && (
              <p className="text-xs text-muted-foreground">{new Date(thought.timestamp).toLocaleTimeString()}</p>
            )}
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {renderMessageWithTooltips(thought.message)}
          </p>

          {smilesStrings.length > 0 && (
            <div className="space-y-3 mt-4 pt-4 border-t border-border">
              {smilesStrings.map((smiles, index) => (
                <MoleculeVisualization key={index} smiles={smiles} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
