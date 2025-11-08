import { useState } from "react";
import { ControlPanel, ResearchParams } from "@/components/ControlPanel";
import { LabMonitor, StreamMessage } from "@/components/LabMonitor";
import { PropertyEvolutionChart, PropertySnapshot } from "@/components/PropertyEvolutionChart";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { Beaker } from "lucide-react";

const Index = () => {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [propertySnapshots, setPropertySnapshots] = useState<PropertySnapshot[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleDemoMode = async () => {
    setIsRunning(true);
    setMessages([]);
    setPropertySnapshots([]);
    toast.success("Loading demonstration messages...");

    const demoSnapshots: PropertySnapshot[] = [
      { iteration: 0, agent: "Starting", LogP: 4.8, TPSA: 90.5, QED: 0.72, MW: 501.7, "SA Score": 2.5, Tanimoto: 1.0 },
      { iteration: 1, agent: "Designer", LogP: 3.9, TPSA: 105.2, QED: 0.81, MW: 485.3, "SA Score": 2.8, Tanimoto: 0.87 },
      { iteration: 2, agent: "Validator", LogP: 3.5, TPSA: 98.3, QED: 0.85, MW: 478.9, "SA Score": 2.6, Tanimoto: 0.85 },
      { iteration: 3, agent: "Designer", LogP: 2.3, TPSA: 45.8, QED: 0.89, MW: 456.7, "SA Score": 3.1, Tanimoto: 0.82 },
      { iteration: 4, agent: "Validator", LogP: 2.1, TPSA: 42.5, QED: 0.91, MW: 448.2, "SA Score": 3.0, Tanimoto: 0.83 },
    ];

    const demoMessages: StreamMessage[] = [
      {
        type: "agent_thought",
        agent: "Designer",
        message: "Starting analysis of the base molecule. Current properties: LogP: 4.8 (high), TPSA: 90.5 (optimal), QED: 0.72 (excellent drug-likeness). To improve bioavailability, I propose reducing lipophilicity by adding polar groups. Current permeability is adequate according to Lipinski's rule.",
        timestamp: Date.now(),
      },
      {
        type: "agent_thought",
        agent: "Validator",
        message: "Validating initial proposal. Calculating molecular descriptors: LogP: 3.9 (significant improvement, now in optimal range), TPSA: 105.2 (acceptable for ADME), MW: 485.3, QED: 0.81 (excellent), SA Score: 2.8 (feasible synthesis). Tanimoto: 0.87 maintains structural similarity. Predicted affinity with receptor improves by 15%.",
        timestamp: Date.now() + 1500,
      },
      {
        type: "agent_thought",
        agent: "Synthesizer",
        message: "Evaluating synthetic route. SA Score: 2.8 indicates that synthesis is viable with 3-4 steps. Addition of hydroxyl group significantly improves solubility. Confirmed: feasible route with standard chemistry. Proposed structure: `CC(O)(C(=O)O)c1ccc(cc1)C(O)CCCN2CCC(CC2)C(O)(c3ccccc3)c4ccccc4`",
        timestamp: Date.now() + 3000,
      },
      {
        type: "agent_thought",
        agent: "Designer",
        message: "Refining the design. New variant with better selectivity towards the target. Predicted properties: LogP: 2.3 (optimal for CNS penetration), TPSA: 45.8 (excellent), MW: 456.7, QED: 0.89 (exceptional drug-like). Predicted toxicity profile is low. SMILES: `CC(C)c1ccc(cc1)C(O)CCCN2CCC(CC2)C(O)(c3ccccc3)c4ccc(O)cc4`",
        timestamp: Date.now() + 4500,
      },
      {
        type: "agent_thought",
        agent: "Validator",
        message: "Comprehensive analysis completed. Comparison with original molecule: LogP improved from 4.8 to 2.3 (52% reduction, now optimal), TPSA: 45.8 (ideal for permeability), MW: 456.7 (within range), Tanimoto: 0.82 (similarity preserved). Lipinski violations: 0. SA Score: 3.1 (moderately easy synthesis). Favorable ADME predictions across all parameters.",
        timestamp: Date.now() + 6000,
      },
      {
        type: "agent_thought",
        agent: "Synthesizer",
        message: "Optimized synthetic route identified. SA Score: 3.1 is acceptable. Proposed synthesis in 4 steps: 1) Selective reduction, 2) Alkylation, 3) Cross-coupling, 4) Deprotection. Overall estimated yield: 45-55%. Improved solubility will facilitate purification and pharmaceutical formulation.",
        timestamp: Date.now() + 7500,
      },
      {
        type: "final_report",
        data: {
          executive_summary: "The research team successfully optimized the initial molecule to improve its pharmacological profile.\n\nKey achievements:\n- LogP reduced from 4.8 to 2.3 (52% improvement, now in optimal range)\n- TPSA optimized to 45.8 (excellent for permeability)\n- QED improved from 0.72 to 0.89 (exceptional drug-likeness)\n- Tanimoto 0.82 maintains the essential pharmacophore\n- SA Score 3.1 indicates feasible synthesis\n- 100% compliance with Lipinski's rule\n- Improved ADME and selectivity\n\nThe final molecule presents superior pharmacological profile with optimized bioavailability and permeability, maintaining low predicted toxicity.",
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

    // Add property snapshots progressively
    for (let i = 0; i < demoSnapshots.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPropertySnapshots(prev => [...prev, demoSnapshots[i]]);
    }

    // Add messages
    for (let i = 0; i < demoMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessages(prev => [...prev, demoMessages[i]]);
      if (i === demoMessages.length - 1) {
        setIsRunning(false);
        toast.success("Demo completed - Check out the tooltips and badges!");
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
          <div className="flex items-center justify-between">
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <ControlPanel onRunCrew={handleRunCrew} onDemoMode={handleDemoMode} isRunning={isRunning} />
          <LabMonitor messages={messages} isRunning={isRunning} />
        </div>
        
        {propertySnapshots.length > 0 && (
          <div className="mt-6">
            <PropertyEvolutionChart snapshots={propertySnapshots} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
