interface EvolveResponse {
  seed: number;
  pid: number;
}

export const evolvePolicy = async (): Promise<EvolveResponse> => {
  try {
    const response = await fetch("http://127.0.0.1:8000/experiments/evolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as EvolveResponse;
  } catch (error) {
    console.error("Error evolving policy:", error);
    throw error;
  }
};

export interface ReplayResponse {
  status: string;
  response: string;
}

export const replayBestAgent = async (
  experimentId: string
): Promise<ReplayResponse> => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/experiments/replay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as ReplayResponse;
  } catch (error) {
    console.error("Error replaying best agent:", error);
    throw error;
  }
};
