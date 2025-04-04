// MuJoCo environment data
export interface Environment {
  id: number;
  name: string;
  image: string;
  description: string;
  complexity: "beginner" | "intermediate" | "advanced";
}

export const environments: Environment[] = [
  {
    id: 1,
    name: "Ant",
    image:
      "https://images.ctfassets.net/kftzwdyauwt9/e0c0947f-1a44-4528-d23c194e7166/37f3c8cdb16c1866de4c33e8d9844d84/table-04.gif",
    description:
      "The Ant environment features a quadruped robot with the goal of learning to walk forward as fast as possible. This environment has a moderate action space and state space complexity, making it a good benchmark for reinforcement learning algorithms.",
    complexity: "intermediate",
  },
  {
    id: 2,
    name: "Half Cheetah",
    image:
      "https://gymnasium.farama.org/_static/videos/mujoco/half_cheetah.gif",
    description:
      "The Half Cheetah environment involves a 2D cheetah robot that needs to learn to run forward. It has a continuous action space and requires the agent to learn coordination between multiple joints to achieve forward momentum.",
    complexity: "intermediate",
  },
  {
    id: 3,
    name: "Hopper",
    image: "https://gymnasium.farama.org/_static/videos/mujoco/hopper.gif",
    description:
      "In the Hopper environment, a one-legged robot must learn to hop forward without falling. This environment is simpler than others but still requires learning a stable hopping gait.",
    complexity: "beginner",
  },
  {
    id: 4,
    name: "Humanoid Standup",
    image:
      "https://gymnasium.farama.org/_static/videos/mujoco/humanoid_standup.gif",
    description:
      "The Humanoid Standup environment challenges an agent to control a humanoid robot to stand up from a lying position. This is a complex task with a high-dimensional state and action space.",
    complexity: "advanced",
  },
  {
    id: 5,
    name: "Inverted Pendulum",
    image:
      "https://gymnasium.farama.org/_static/videos/mujoco/inverted_pendulum.gif",
    description:
      "The Inverted Pendulum is a classic control problem where the agent must balance a pole on a cart. It has a simple state and action space, making it a good starting point for RL algorithms.",
    complexity: "beginner",
  },
  {
    id: 6,
    name: "Inverted Double Pendulum",
    image:
      "https://gymnasium.farama.org/_static/videos/mujoco/inverted_double_pendulum.gif",
    description:
      "The Inverted Double Pendulum extends the classic pendulum problem with two connected poles. The increased complexity makes it a more challenging control problem that requires sophisticated policies.",
    complexity: "advanced",
  },
];

export const getEnvironmentById = (id: number): Environment | undefined => {
  return environments.find((env) => env.id === id);
};
