import Dexie, { EntityTable } from "dexie";

export interface Experiment {
  id: string;
  envId: number;
}

const db = new Dexie("ExperimentsDatabase") as Dexie & {
  experiments: EntityTable<Experiment>;
};

db.version(2).stores({
  experiments: "id", // using string id as primary key
});

export { db };
