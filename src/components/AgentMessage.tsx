import { Card } from "@/components/ui/card";
import { MoleculeVisualization } from "./MoleculeVisualization";
import { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  // Create a regex pattern from all chemical terms
  const termPattern = new RegExp(
    `\\b(${Object.keys(chemicalTerms).join('|')})\\b`,
    'gi'
  );
  
  let match;
  let key = 0;
  
  while ((match = termPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${key++}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }
    
    // Add the matched term with tooltip
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
    
    lastIndex = match.index + match[0].length;
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
