import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEnvironmentById, Environment } from "@/data/environments";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/data/db";

const EnvironmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    if (id) {
      const envId = parseInt(id);
      const env = getEnvironmentById(envId);

      if (env) {
        setEnvironment(env);
      } else {
        // Environment not found, redirect to home
        navigate("/");
        toast({
          title: "Environment not found",
          description: "The requested environment could not be found.",
          variant: "destructive",
        });
      }
    }

    setLoading(false);
  }, [id, navigate, toast]);

  const handleEvolvePolicy = async (): Promise<void> => {
    if (!environment) return;

    try {
      // Generate a UUID for the experiment
      const experimentId = crypto.randomUUID();

      // Add the experiment to the database with the UUID and creation date
      await db.experiments.add({
        id: experimentId,
        envId: parseInt(id!), // Convert string ID to number and ensure it exists
        createdAt: new Date(), // Add creation timestamp
      });

      // Navigate to the evolution page with the UUID
      navigate(`/evolution/${experimentId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create experiment",
        variant: "destructive",
      });
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
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Environments</span>
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[calc(80vh-6rem)] px-6">
        <div className="w-full grid md:grid-cols-2 gap-10 max-w-5xl mx-auto items-start my-auto">
          {/* Left Column */}
          {/* Environment title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-12">
              MuJoCo {environment.name}
            </h1>
  
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {environment.description}
            </p>
  
            <span className="inline-block px-3 py-1 mb-6 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              Complexity: {environment.complexity}
            </span>
  
            <Button
              className="w-full sm:w-auto px-8 py-6 rounded-md text-lg bg-tpg-blue hover:bg-tpg-blue/90 flex items-center gap-2"
              onClick={handleEvolvePolicy}
            >
              <Play className="h-5 w-5" />
              <span>Evolve Policy</span>
            </Button>
          </motion.div>
  
          {/* Right Column (Image) */}
          <motion.div
            className="flex justify-center md:justify-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="rounded-xl overflow-hidden w-72 h-72 shadow-md bg-gray-100 flex items-center justify-center mt-6">
              <img
                src={environment.image}
                alt={environment.name}
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default EnvironmentDetail;
