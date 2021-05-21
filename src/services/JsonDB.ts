import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";

interface Secret {
	ascii: string;
	hex: string;
	base32: string;
	otpauth_url?: string | undefined;
}

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	age: number;
	isOtpValidated: boolean;
	isSecretInvalid: boolean;
	isUsing2FA: boolean;
	secret?: Secret;
	temp_secret: Secret;
}

const db = new JsonDB(new Config("storageDB", true, false, "/"));

export default db;
