import { useState } from "react";
import { ControlPanel, ResearchParams } from "@/components/ControlPanel";
import { LabMonitor, StreamMessage } from "@/components/LabMonitor";
import { toast } from "sonner";
import { Beaker } from "lucide-react";

const Index = () => {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleDemoMode = async () => {
    setIsRunning(true);
    setMessages([]);
    toast.success("Cargando mensajes de demostración...");

    const demoMessages: StreamMessage[] = [
      {
        type: "agent_thought",
        agent: "Designer",
        message: "Iniciando análisis de la molécula base. Propiedades actuales: LogP: 4.8 (alto), TPSA: 90.5 (óptimo), QED: 0.72 (excelente drug-likeness). Para mejorar la bioavailability, propongo reducir la lipofilia añadiendo grupos polares. La permeability actual es adecuada según la regla de Lipinski.",
        timestamp: Date.now(),
      },
      {
        type: "agent_thought",
        agent: "Validator",
        message: "Validando propuesta inicial. Calculando descriptores moleculares: LogP: 3.9 (mejora significativa, ahora en rango óptimo), TPSA: 105.2 (aceptable para ADME), MW: 485.3, QED: 0.81 (excelente), SA Score: 2.8 (síntesis factible). Tanimoto: 0.87 mantiene similitud estructural. La affinity predicha con el receptor mejora un 15%.",
        timestamp: Date.now() + 1500,
      },
      {
        type: "agent_thought",
        agent: "Synthesizer",
        message: "Evaluando ruta sintética. SA Score: 2.8 indica que la síntesis es viable con 3-4 pasos. La adición del grupo hidroxilo mejora la solubility significativamente. Confirmado: ruta factible con química estándar. Estructura propuesta: `CC(O)(C(=O)O)c1ccc(cc1)C(O)CCCN2CCC(CC2)C(O)(c3ccccc3)c4ccccc4`",
        timestamp: Date.now() + 3000,
      },
      {
        type: "agent_thought",
        agent: "Designer",
        message: "Refinando el diseño. Nueva variante con mejor selectivity hacia el target. Propiedades predichas: LogP: 2.3 (óptimo para CNS penetration), TPSA: 45.8 (excelente), MW: 456.7, QED: 0.89 (drug-like excepcional). El perfil de toxicity predicho es bajo. SMILES: `CC(C)c1ccc(cc1)C(O)CCCN2CCC(CC2)C(O)(c3ccccc3)c4ccc(O)cc4`",
        timestamp: Date.now() + 4500,
      },
      {
        type: "agent_thought",
        agent: "Validator",
        message: "Análisis exhaustivo completado. Comparación con molécula original: LogP mejoró de 4.8 a 2.3 (52% reducción, ahora óptimo), TPSA: 45.8 (ideal para permeability), MW: 456.7 (dentro de rango), Tanimoto: 0.82 (similitud preservada). Violaciones de Lipinski: 0. SA Score: 3.1 (síntesis moderadamente fácil). Predicciones ADME favorables en todos los parámetros.",
        timestamp: Date.now() + 6000,
      },
      {
        type: "agent_thought",
        agent: "Synthesizer",
        message: "Ruta sintética optimizada identificada. SA Score: 3.1 es aceptable. Propongo síntesis en 4 pasos: 1) Reducción selectiva, 2) Alquilación, 3) Acoplamiento cross-coupling, 4) Desprotección. Rendimiento global estimado: 45-55%. La solubility mejorada facilitará la purificación y formulación farmacéutica.",
        timestamp: Date.now() + 7500,
      },
      {
        type: "final_report",
        data: {
          executive_summary: "El equipo de investigación optimizó exitosamente la molécula inicial para mejorar su perfil farmacológico.\n\nLogros clave:\n- LogP reducido de 4.8 a 2.3 (52% mejora, ahora en rango óptimo)\n- TPSA optimizada a 45.8 (excelente para permeabilidad)\n- QED mejorado de 0.72 a 0.89 (drug-likeness excepcional)\n- Tanimoto 0.82 mantiene el farmacóforo esencial\n- SA Score 3.1 indica síntesis factible\n- Cumple 100% regla de Lipinski\n- ADME y selectivity mejorados\n\nLa molécula final presenta perfil farmacológico superior con bioavailability y permeability optimizadas, manteniendo baja toxicity predicha.",
          final_smiles: "CC(C)c1ccc(cc1)C(O)CCCN2CCC(CC2)C(O)(c3ccccc3)c4ccc(O)cc4",
          verifiable_data: {
            starting_molecule: {
              smiles: "CC(C)(C(=O)O)c1ccc(cc1)C(O)CCCN2CCC(CC2)C(O)(c3ccccc3)c4ccccc4",
              LogP: 4.8,
              TPSA: 90.5,
              MW: 501.7,
              QED: 0.72,
            },
            final_molecule: {
              smiles: "CC(C)c1ccc(cc1)C(O)CCCN2CCC(CC2)C(O)(c3ccccc3)c4ccc(O)cc4",
              LogP: 2.3,
              TPSA: 45.8,
              MW: 456.7,
              QED: 0.89,
              "SA Score": 3.1,
            },
            improvements: {
              LogP_reduction: -2.5,
              LogP_percent_improvement: 52.1,
              TPSA_optimization: -44.7,
              QED_improvement: 0.17,
            },
            constraints_satisfied: {
              Tanimoto: 0.82,
              lipinski_violations: 0,
              synthetic_accessibility: "Feasible (SA Score 3.1)",
            },
          },
        },
      },
    ];

    for (let i = 0; i < demoMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessages(prev => [...prev, demoMessages[i]]);
      if (i === demoMessages.length - 1) {
        setIsRunning(false);
        toast.success("Demo completada - Observa los tooltips y badges!");
      }
    }
  };

  const handleRunCrew = async (params: ResearchParams) => {
    setIsRunning(true);
    setMessages([]);

    try {
      // TODO: Replace with actual SSE endpoint when backend is ready
      // const eventSource = new EventSource(`/api/run-crew?${new URLSearchParams({
      //   smiles: params.smiles,
      //   goal: params.goal,
      //   similarity: params.similarity.toString(),
      //   mwMin: params.mwMin.toString(),
      //   mwMax: params.mwMax.toString(),
      // })}`);

      // eventSource.onmessage = (event) => {
      //   const data = JSON.parse(event.data);
      //   setMessages(prev => [...prev, data]);
      //   if (data.type === 'final_report') {
      //     eventSource.close();
      //     setIsRunning(false);
      //   }
      // };

      // eventSource.onerror = () => {
      //   eventSource.close();
      //   setIsRunning(false);
      //   toast.error("Connection error. Please try again.");
      // };

      // Mock streaming for demo purposes
      toast.success("Research crew started!");
      
      const mockMessages: StreamMessage[] = [
        {
          type: "agent_thought",
          agent: "Designer",
          message: "Analyzing the starting molecule. I will propose modifications to decrease LogP by introducing polar groups. Let me suggest adding a hydroxyl group at position C3. Proposed SMILES: `CC(O)(C(=O)O)c1ccc(cc1)C(O)CCCN2CCC(CC2)C(O)(c3ccccc3)c4ccccc4`",
          timestamp: Date.now(),
        },
        {
          type: "agent_thought",
          agent: "Validator",
          message: "Validating the proposed structure... The SMILES string is chemically valid. Calculating properties: LogP decreased from 4.8 to 4.2, molecular weight increased slightly to 524.7. Tanimoto similarity is 0.85, within acceptable range. Structure approved for synthesis review.",
          timestamp: Date.now() + 2000,
        },
        {
          type: "agent_thought",
          agent: "Synthesizer",
          message: "Evaluating synthetic feasibility... The addition of a hydroxyl group at the tertiary carbon is synthetically challenging. Recommendation: Consider alternative positions or protecting group strategies. However, the route is feasible with 3-4 steps from the parent compound.",
          timestamp: Date.now() + 4000,
        },
        {
          type: "agent_thought",
          agent: "Designer",
          message: "Based on Synthesizer feedback, I propose an alternative: introducing a carboxylic acid group on the aromatic ring instead. This is synthetically more accessible. New proposal: `CC(C)(C(=O)O)c1ccc(cc1)C(O)CCCN2CCC(CC2)C(O)(c3ccc(C(=O)O)cc3)c4ccccc4`",
          timestamp: Date.now() + 6000,
        },
        {
          type: "agent_thought",
          agent: "Validator",
          message: "Validating revised structure... Excellent! LogP now 3.9, significantly improved. Molecular weight 568.7, still within range. Tanimoto similarity 0.82. All constraints satisfied. This is a strong candidate.",
          timestamp: Date.now() + 8000,
        },
        {
          type: "final_report",
          data: {
            executive_summary: "The research crew successfully optimized the starting molecule (Fexofenadine) to decrease LogP while maintaining structural similarity and synthetic feasibility.\n\nKey achievements:\n- LogP reduced from 4.8 to 3.9 (19% improvement)\n- Maintained Tanimoto similarity of 0.82 (above 0.7 threshold)\n- Molecular weight increased to 568.7 (within 200-800 range)\n- Synthetic route feasible with standard chemistry\n\nThe final optimized molecule introduces a carboxylic acid group on one of the diphenyl rings, increasing polarity and reducing lipophilicity without compromising the core pharmacophore.",
            final_smiles: "CC(C)(C(=O)O)c1ccc(cc1)C(O)CCCN2CCC(CC2)C(O)(c3ccc(C(=O)O)cc3)c4ccccc4",
            verifiable_data: {
              starting_molecule: {
                smiles: params.smiles,
                logP: 4.8,
                molecular_weight: 501.7,
              },
              final_molecule: {
                smiles: "CC(C)(C(=O)O)c1ccc(cc1)C(O)CCCN2CCC(CC2)C(O)(c3ccc(C(=O)O)cc3)c4ccccc4",
                logP: 3.9,
                molecular_weight: 568.7,
              },
              improvements: {
                logP_change: -0.9,
                logP_percent_change: -18.75,
              },
              constraints_satisfied: {
                tanimoto_similarity: 0.82,
                min_similarity: params.similarity,
                molecular_weight_range: `${params.mwMin}-${params.mwMax}`,
              },
            },
          },
        },
      ];

      for (let i = 0; i < mockMessages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2500));
        setMessages(prev => [...prev, mockMessages[i]]);
        if (i === mockMessages.length - 1) {
          setIsRunning(false);
          toast.success("Research complete!");
        }
      }

    } catch (error) {
      console.error("Error running crew:", error);
      toast.error("Failed to run research crew. Please try again.");
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Beaker className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Agentic Medicinal Chemist
              </h1>
              <p className="text-sm text-muted-foreground">AI-Powered Molecular Design & Optimization</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          <ControlPanel onRunCrew={handleRunCrew} onDemoMode={handleDemoMode} isRunning={isRunning} />
          <LabMonitor messages={messages} isRunning={isRunning} />
        </div>
      </main>
    </div>
  );
};

export default Index;
