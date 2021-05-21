import express, { Request } from "express";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";
import speakeasy from "speakeasy";

import db, { User } from "./services/JsonDB";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(express.json());

interface CustomRequest<T> extends Request {
	body: T;
}

interface VerifyRequest {
	userId: string;
	token: string;
}

app.post("/register", (req: CustomRequest<User>, res) => {
	const { firstName, lastName, age } = req.body;

	try {
		const id = uuid();

		const secret = speakeasy.generateSecret();

		const user: User = {
			id,
			firstName,
			lastName,
			age,
			isOtpValidated: false,
			isSecretInvalid: false,
			isUsing2FA: false,
			temp_secret: secret,
		};

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

		res.status(200).json({ message: "success", user });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
});

app.post("/verify", (req: CustomRequest<VerifyRequest>, res) => {
	const { userId, token } = req.body;
	const path = `/users/${userId}`;

	try {
		const user = db.getObject<User>(path);

		const secret = user.temp_secret.base32;

		const verified = speakeasy.totp.verify({ secret, encoding: "base32", token });

		if (verified) {
			const fullSecret = user.temp_secret;

			db.push(path, <User>{ ...user, isOtpValidated: true, isUsing2FA: true, secret: fullSecret });

			res.status(200).json({ message: "Verified" });
		} else {
			res.status(404).json({ message: "Un-Authorized" });
		}
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
});

app.post("/validate", (req: CustomRequest<VerifyRequest>, res) => {
	const { userId, token } = req.body;
	const path = `/users/${userId}`;

	try {
		const user = db.getObject<User>(path);

		if (user.isUsing2FA === false) return res.status(400).json({ message: "User does not have OTP set up" });
		if (user.isOtpValidated === false) return res.status(400).json({ message: "Need to verify code generator first" });

		const secret = user.temp_secret.base32;

		const verified = speakeasy.totp.verify({ secret, encoding: "base32", token });

		if (verified) {
			res.status(200).json({ message: "Authorization granted" });
		} else {
			res.status(404).json({ message: "You are not the right person" });
		}
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
});

app.listen(PORT, () => console.log(`Server started and running on port: ${PORT}`));
