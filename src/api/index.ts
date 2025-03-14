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
