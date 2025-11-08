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
  "LogP": "Coeficiente de partición octanol-agua. Mide la lipofilia de la molécula (qué tan soluble es en grasa vs agua). Valores típicos: -2 a 6.",
  "logP": "Coeficiente de partición octanol-agua. Mide la lipofilia de la molécula (qué tan soluble es en grasa vs agua). Valores típicos: -2 a 6.",
  "TPSA": "Área de superficie polar topológica. Predice la permeabilidad de la membrana celular. Valores bajos (<140 Ų) favorecen la absorción oral.",
  "QED": "Quantitative Estimate of Drug-likeness. Métrica que evalúa qué tan similar es la molécula a un fármaco típico. Escala: 0 (no drug-like) a 1 (muy drug-like).",
  "SA Score": "Synthetic Accessibility Score. Estima qué tan fácil es sintetizar la molécula en el laboratorio. Escala: 1 (muy fácil) a 10 (muy difícil).",
  "Tanimoto": "Medida de similitud molecular basada en fingerprints químicos. Compara estructuras químicas. Escala: 0 (completamente diferente) a 1 (idéntica).",
  "Lipinski": "Regla de los 5 de Lipinski. Criterios para predecir biodisponibilidad oral: MW<500, LogP<5, HBD<5, HBA<10.",
  "bioavailability": "Biodisponibilidad. Fracción del fármaco que alcanza la circulación sistémica sin cambios. Crítico para fármacos orales.",
  "permeability": "Permeabilidad. Capacidad de una molécula para cruzar membranas biológicas. Esencial para la absorción y distribución.",
  "solubility": "Solubilidad. Capacidad de disolverse en un solvente. Afecta la absorción y biodisponibilidad del fármaco.",
  "toxicity": "Toxicidad. Potencial de una sustancia para causar daño a organismos vivos. Se evalúa en múltiples niveles.",
  "affinity": "Afinidad. Fuerza de unión entre una molécula (ligando) y su objetivo biológico (receptor). Medida por Kd o IC50.",
  "selectivity": "Selectividad. Preferencia de una molécula por un objetivo específico sobre otros. Reduce efectos secundarios.",
  "ADME": "Absorción, Distribución, Metabolismo y Excreción. Propiedades farmacocinéticas que determinan el comportamiento del fármaco en el cuerpo.",
};

interface PropertyRange {
  optimal: [number, number];
  acceptable: [number, number];
  reverse?: boolean; // true si valores más bajos son mejores
}

const propertyRanges: Record<string, PropertyRange> = {
  "LogP": { optimal: [0, 3], acceptable: [-0.4, 5.6] },
  "logP": { optimal: [0, 3], acceptable: [-0.4, 5.6] },
  "TPSA": { optimal: [20, 90], acceptable: [0, 140], reverse: true },
  "QED": { optimal: [0.67, 1], acceptable: [0.49, 1] },
  "SA Score": { optimal: [1, 3], acceptable: [1, 6], reverse: true },
  "Tanimoto": { optimal: [0.7, 0.95], acceptable: [0.5, 1] },
  "MW": { optimal: [160, 450], acceptable: [150, 500], reverse: true },
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
      badgeClassName: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-800",
      label: "Óptimo"
    },
    acceptable: {
      icon: AlertTriangle,
      className: "text-yellow-600 dark:text-yellow-400",
      badgeVariant: "secondary" as const,
      badgeClassName: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800",
      label: "Aceptable"
    },
    problematic: {
      icon: XCircle,
      className: "text-red-600 dark:text-red-400",
      badgeVariant: "destructive" as const,
      badgeClassName: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800",
      label: "Problemático"
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={config.badgeVariant} className={`${config.badgeClassName} ml-1.5 gap-1 text-xs font-semibold`}>
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
    `\\b(${Object.keys(propertyRanges).join('|')})\\s*[:=]?\\s*(-?\\d+\\.?\\d*)`,
    'gi'
  );
  
  // Create a regex pattern from all chemical terms
  const termPattern = new RegExp(
    `\\b(${Object.keys(chemicalTerms).join('|')})\\b`,
    'gi'
  );
  
  // First pass: find all matches (both property-value pairs and terms)
  const allMatches: Array<{ index: number; length: number; type: 'property-value' | 'term'; match: RegExpExecArray }> = [];
  
  let match;
  while ((match = propertyValuePattern.exec(text)) !== null) {
    allMatches.push({ index: match.index, length: match[0].length, type: 'property-value', match });
  }
  
  while ((match = termPattern.exec(text)) !== null) {
    // Check if this term is part of a property-value pair
    const isPartOfPropertyValue = allMatches.some(
      m => m.type === 'property-value' && match.index >= m.index && match.index < m.index + m.length
    );
    if (!isPartOfPropertyValue) {
      allMatches.push({ index: match.index, length: match[0].length, type: 'term', match });
    }
  }
  
  // Sort matches by index
  allMatches.sort((a, b) => a.index - b.index);
  
  // Second pass: render matches
  for (const { index, length, type, match } of allMatches) {
    // Add text before the match
    if (index > lastIndex) {
      parts.push(
        <span key={`text-${key++}`}>
          {text.substring(lastIndex, index)}
        </span>
      );
    }
    
    if (type === 'property-value') {
      const property = match[1];
      const value = parseFloat(match[2]);
      const status = getValueStatus(property, value);
      
      parts.push(
        <span key={`prop-${key++}`} className="inline-flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="underline decoration-dotted decoration-primary/50 cursor-help">
                  {property}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{chemicalTerms[property] || "Propiedad química"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {text[index + property.length] === ':' || text[index + property.length] === '=' ? 
            text[index + property.length] : ''}{' '}
          <StatusIndicator status={status} value={match[2]} />
        </span>
      );
    } else {
      // Add term with tooltip
      const term = match[0];
      const termKey = Object.keys(chemicalTerms).find(
        k => k.toLowerCase() === term.toLowerCase()
      );
      
      if (termKey) {
        parts.push(
          <TooltipProvider key={`tooltip-${key++}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="underline decoration-dotted decoration-primary/50 cursor-help">
                  {term}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{chemicalTerms[termKey]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    }
    
    lastIndex = index + length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${key++}`}>{text.substring(lastIndex)}</span>
    );
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
              <p className="text-xs text-muted-foreground">
                {new Date(thought.timestamp).toLocaleTimeString()}
              </p>
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
