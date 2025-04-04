import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  RefreshCw,
  List,
  Activity,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Environment, getEnvironmentById } from "@/data/environments";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import LogPanel from "@/components/LogPanel";
import VisualizationPanel from "@/components/VisualizationPanel";
import { db } from "@/data/db";
import { evolvePolicy, replayBestAgent } from "@/api";

const PolicyEvolution = () => {
  const { id: experimentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEvolving, setIsEvolving] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);

  // Evolution mutation
  const evolveMutation = useMutation({
    mutationFn: evolvePolicy,
    onSuccess: async (data) => {
      try {
        // Update the experiment in the database with seed and pid
        await db.experiments.where("id").equals(experimentId!).modify({
          seed: data.seed,
          pid: data.pid,
        });

        setIsEvolving(true);
        // Add initial log entry
        const timestamp = new Date().toISOString();
        toast({
          title: "Evolution started",
          description: `Starting evolution for ${environment?.name} (PID: ${data.pid}, Seed: ${data.seed})`,
        });
      } catch (error) {
        console.error("Error updating experiment:", error);
        toast({
          title: "Warning",
          description:
            "Evolution started but failed to save experiment details.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      setIsEvolving(false);
      toast({
        title: "Evolution failed",
        description: "Failed to start the evolution process. Please try again.",
        variant: "destructive",
      });
      console.error("Evolution error:", error);
    },
  });

  // Replay mutation
  const replayMutation = useMutation({
    mutationFn: () => replayBestAgent(experimentId!),
    onSuccess: () => {
      setIsReplaying(false);
    },
    onError: (error) => {
      setIsReplaying(false);
      toast({
        title: "Replay failed",
        description: "Failed to start the replay process. Please try again.",
        variant: "destructive",
      });
      console.error("Replay error:", error);
    },
  });

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    const loadExperiment = async () => {
      if (!experimentId) {
        navigate("/");
        toast({
          title: "Experiment not found",
          description: "No experiment ID provided.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Get the experiment from the database
        const experiment = await db.experiments
          .where("id")
          .equals(experimentId)
          .first();

        if (!experiment) {
          navigate("/");
          toast({
            title: "Experiment not found",
            description: "The requested experiment could not be found.",
            variant: "destructive",
          });
          return;
        }

        // Get the environment using the envId from the experiment
        const env = getEnvironmentById(experiment.envId);
        if (!env) {
          navigate("/");
          toast({
            title: "Environment not found",
            description:
              "The environment associated with this experiment could not be found.",
            variant: "destructive",
          });
          return;
        }

        setEnvironment(env);
        setLoading(false);
      } catch (error) {
        console.error("Error loading experiment:", error);
        navigate("/");
        toast({
          title: "Error",
          description: "Failed to load the experiment.",
          variant: "destructive",
        });
      }
    };

    loadExperiment();
  }, [experimentId, navigate, toast]);

  const handleToggleEvolution = async () => {
    if (isEvolving) {
      // Handle stopping evolution here (we'll implement this later)
      setIsEvolving(false);
      toast({
        title: "Evolution paused",
        description: `Paused evolution for ${environment?.name}`,
      });
    } else {
      // Start evolution
      evolveMutation.mutate();
    }
  };

  const handleReset = () => {
    setIsEvolving(false);
    setIsReplaying(false);
    toast({
      title: "Evolution reset",
      description: `Reset evolution for ${environment?.name}`,
    });
  };

  const handleReplay = async () => {
    toast({
      title: "Replay started",
      description: `Starting replay for ${environment?.name}`,
    });
    replayMutation.mutate();
  };

  const handleBack = async () => {
    // Get the experiment from the database
    const experiment = await db.experiments
      .where("id")
      .equals(experimentId)
      .first();

    if (!experiment) {
      navigate("/");
      toast({
        title: "Experiment not found",
        description: "The requested experiment could not be found.",
        variant: "destructive",
      });
      return;
    } else {
      console.log(`Navigating back to environment: ${experiment.envId}`);
      navigate(`/environment/${experiment.envId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-tpg-blue border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!environment) {
    return null;
  }

  return (
    <motion.div
      className="min-h-screen pt-24 pb-16 px-6 md:px-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            onClick={() => handleBack()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Environment</span>
          </Button>
        </div>

        {/* Page title */}
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Evolving Policy for MuJoCo {environment.name} Environment
        </motion.h1>

        {/* Control buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant={isEvolving ? "outline" : "default"}
            className="flex items-center gap-2"
            onClick={handleToggleEvolution}
            disabled={
              evolveMutation.isPending ||
              isReplaying ||
              replayMutation.isPending
            }
          >
            {evolveMutation.isPending ? (
              <div className="h-4 w-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
            ) : isEvolving ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>
              {evolveMutation.isPending
                ? "Starting Evolution..."
                : isEvolving
                ? "Pause Evolution"
                : "Start Evolution"}
            </span>
          </Button>

          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={handleReplay}
            disabled={
              replayMutation.isPending ||
              evolveMutation.isPending ||
              isEvolving ||
              isReplaying
            }
          >
            <Video className="h-4 w-4" />
            <span>Replay Best Agent</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleReset}
            disabled={evolveMutation.isPending || isEvolving || isReplaying}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        </div>

        <div className="mb-8">
          {isEvolving && (
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Evolution in progress...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 max-w-[50%] mx-auto">
          {/* Visualization panel */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-semibold">Agent Visualization</h2>
            </div>
            <Separator className="mb-4" />
            <VisualizationPanel />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PolicyEvolution;
