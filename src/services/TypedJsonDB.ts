import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	age: number;
}

let db = new JsonDB(new Config("storageDB", true, false, "/"));

export default db;
