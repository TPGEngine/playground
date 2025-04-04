import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db, Experiment } from "../data/db";
import { useNavigate } from "react-router-dom";
import { getEnvironmentById } from "../data/environments";
import { formatDistanceToNow } from "date-fns";

interface ExperimentWithDetails extends Experiment {
  createdAt?: Date;
}

const Experiments = () => {
  const [experiments, setExperiments] = useState<ExperimentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Fetch experiments from the database
    const fetchExperiments = async () => {
      try {
        const allExperiments = await db.experiments.toArray();
        // Add mock data for demo purposes - you should replace this with real data
        const experimentsWithDetails = allExperiments.map((exp) => ({
          ...exp,
          createdAt: new Date(Date.now() - Math.random() * 10000000000),
        }));
        setExperiments(experimentsWithDetails);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch experiments")
        );
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  const handleExperimentClick = (experimentId: string) => {
    navigate(`/evolution/${experimentId}`);
  };

  return (
    <motion.div
      className="min-h-screen pt-32 pb-16 px-6 md:px-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Experiments
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Track and visualize your training experiments with the TPG algorithm
            across different MuJoCo environments.
          </motion.p>
        </div>

        <motion.div
          className="glass-card p-8 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {loading ? (
            <div className="text-center">
              <p className="text-gray-500">Loading experiments...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-500">Error: {error.message}</p>
            </div>
          ) : experiments.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-500">No experiments have been run yet.</p>
              <p className="mt-2 text-sm text-gray-400">
                Select an environment from the home page to begin training with
                TPG.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {experiments.map((exp) => {
                const environment = getEnvironmentById(exp.envId);
                return (
                  <motion.div
                    key={exp.id}
                    className="p-6 rounded-lg bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleExperimentClick(exp.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {environment?.name || "Unknown Environment"}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {environment?.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>ID: {exp.id.slice(0, 8)}...</span>
                          {exp.createdAt && (
                            <span>
                              Created {formatDistanceToNow(exp.createdAt)} ago
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              environment?.complexity === "beginner"
                                ? "bg-green-100 text-green-800"
                                : environment?.complexity === "intermediate"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {environment?.complexity || "unknown"} complexity
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Experiments;
