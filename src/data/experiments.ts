export interface Experiment {
  id: string;
  environmentId: number;
  environmentName: string;
  createdAt: string;
  updatedAt: string;
}

const DB_NAME = "tpgExperimentDB";
const DB_VERSION = 1;
const STORE_NAME = "experiments";

/**
 * Opens the IndexedDB database for experiments
 */
export const openExperimentDB = (): Promise<IDBDatabase> => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        // Create indexes for faster querying
        store.createIndex("environmentId", "environmentId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event: Event) => {
      reject(`Database error: ${(event.target as IDBOpenDBRequest).error}`);
    };
  });
};

/**
 * Saves a new experiment to the database
 */
export const saveExperiment = async (
  experiment: Experiment
): Promise<string> => {
  try {
    const db = await openExperimentDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.add(experiment);

    return new Promise<string>((resolve, reject) => {
      request.onsuccess = () => resolve(experiment.id);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error("Error saving experiment:", error);
    throw error;
  }
};

/**
 * Updates an existing experiment
 */
export const updateExperiment = async (
  id: string,
  updates: Partial<Experiment>
): Promise<Experiment> => {
  try {
    const db = await openExperimentDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // First get the existing data
    const getRequest = store.get(id);

    return new Promise<Experiment>((resolve, reject) => {
      getRequest.onsuccess = () => {
        const experiment = getRequest.result as Experiment | undefined;
        if (!experiment) {
          reject(new Error(`Experiment with ID ${id} not found`));
          return;
        }

        // Merge the existing data with updates
        const updatedExperiment: Experiment = { ...experiment, ...updates };
        const updateRequest = store.put(updatedExperiment);

        updateRequest.onsuccess = () => resolve(updatedExperiment);
        updateRequest.onerror = () => reject(updateRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error("Error updating experiment:", error);
    throw error;
  }
};

/**
 * Gets an experiment by ID
 */
export const getExperiment = async (
  id: string
): Promise<Experiment | undefined> => {
  try {
    const db = await openExperimentDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(id);

    return new Promise<Experiment | undefined>((resolve, reject) => {
      request.onsuccess = () =>
        resolve(request.result as Experiment | undefined);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error("Error getting experiment:", error);
    throw error;
  }
};

/**
 * Gets all experiments for a specific environment
 */
export const getExperimentsByEnvironment = async (
  environmentId: number
): Promise<Experiment[]> => {
  try {
    const db = await openExperimentDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("environmentId");

    const request = index.getAll(environmentId);

    return new Promise<Experiment[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as Experiment[]);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error("Error getting experiments by environment:", error);
    throw error;
  }
};

/**
 * Gets all experiments
 */
export const getAllExperiments = async (): Promise<Experiment[]> => {
  try {
    const db = await openExperimentDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    return new Promise<Experiment[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as Experiment[]);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error("Error getting all experiments:", error);
    throw error;
  }
};

/**
 * Deletes an experiment by ID
 */
export const deleteExperiment = async (id: string): Promise<void> => {
  try {
    const db = await openExperimentDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(id);

    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error("Error deleting experiment:", error);
    throw error;
  }
};
