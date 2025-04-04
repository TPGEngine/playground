import Dexie, { EntityTable } from "dexie";

export interface Experiment {
  id: string;
  envId: number;
  seed?: number; // Optional field for the evolution seed
  pid?: number; // Optional field for the process ID
  createdAt: Date; // Timestamp when the experiment was created
}

const db = new Dexie("ExperimentsDatabase") as Dexie & {
  experiments: EntityTable<Experiment>;
};

db.version(3).stores({
  experiments: "id", // using string id as primary key
});

export { db };
