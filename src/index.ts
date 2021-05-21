import express, { Request } from "express";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";

import db, { User } from "./services/TypedJsonDB";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(express.json());

interface CustomRequest<T> extends Request {
	body: T;
}

app.post("/register", (req: CustomRequest<User>, res) => {
	const { firstName, lastName, age } = req.body;

	try {
		const id = uuid();
		const user = {
			id,
			firstName,
			lastName,
			age,
		} as User;

		db.push(`/users/${id}`, user);

		res.status(200).json({ message: "success", id });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
});

app.get("/getUserById", (req, res) => {
	const { id } = req.query;
	try {
		const user = db.getObject<User>(`/users/${id}`);

		console.log(user);
		res.status(200).json({ message: "success", user });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
});

app.listen(PORT, () => console.log(`Server started and running on port: ${PORT}`));
