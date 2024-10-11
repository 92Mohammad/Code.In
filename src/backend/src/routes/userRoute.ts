import { Request, Response, Router } from "express";
const router = Router();
import jwt from "jsonwebtoken";
import prisma from "../db";
import { createUser, findUser } from "../db/user";
import { LoginInput, SignUpInput } from "../@utils/types";
import { generateAccessToken, generateRefreshToken } from "../middleware/auth";


router.post("/signup", async (req: Request, res: Response) => {
	const parsedInput = SignUpInput.safeParse(req.body.data);

	if (!parsedInput.success) {
		return res
			.status(400)
			.json({ success: false, message: parsedInput.error });
	}

	try {
		const { username, email, password } = parsedInput.data;
		// check if user already exist or not
		const user = await prisma.user.findFirst({
			where: {
				email,
			},
		});
		if (user) {
			return res.json({ success: false, msg: "User already exist" });
		}
		// otherwise user don't exist then create new user
		const newUser = await createUser(username, email, password);
		if (!newUser.success) {
			return res.json({ success: false, message: newUser.msg });
		}
		return res
			.status(200)
			.json({ success: true, message: "User created successfully" });
	} catch (error: any) {
		console.error(error.message);
		return res.status(500).json({ success: false, message: error.message });
	}
});

router.post("/login", async (req: Request, res: Response) => {
	const parsedInput = LoginInput.safeParse(req.body.data);
	if (!parsedInput.success) {
		return res
			.status(400)
			.json({ success: false, message: parsedInput.error });
	}
	try {
		const { email, password } = parsedInput.data;
		// check if user exist or not
		const userExist = await findUser(email, password);
		if (!userExist.success || userExist.userId === undefined) {
			return res.json({ success: false, message: userExist.msg });
		}
		const accessToken = generateAccessToken(userExist.userId, "user");
		const refreshToken = generateRefreshToken(userExist.userId, "user");

		// Set refresh token in an HTTP-only cookie
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // Set to true in production
			sameSite: "strict",
			path: "/api/user/refresh-token", // This endpoint only
		});

		return res.status(201).json({
			success: true,
			message: "login successfully",
			token: accessToken,
		});
	} catch (error: any) {
		console.error(error.message);
		return res.status(500).json({ success: false, message: error.message });
	}
});

// Refresh token endpoint
router.get("/refresh-token", (req: Request, res: Response) => {
	const cookie = req.cookies; // Get refresh token from the cookie
	const obj = JSON.stringify(cookie);
	console.log('this is refresh token : ', obj);
	
	const refreshToken = cookie.refreshToken;	
	

	if (!refreshToken) {
		return res.status(401).json({ success: false,  message: "No refresh token found" });
	}

	try {
		const payload = jwt.verify(
			refreshToken,
			process.env.JWT_REFRESH_SECRET!
		) as { userId: string; role: string };
		console.log('this is payload after verifying refresh token', payload);
		const newAccessToken = generateAccessToken(
			payload.userId,
			payload.role
		);
		// verify the refresh token here if refresh token does not verify correctly then logout the user
		console.log("new access token", newAccessToken);
		// Send a new access token
		return res.json({ success: true,  accessToken: newAccessToken });
	} catch (error: any) {
		// Handle different error scenarios
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({
				success: false,
				message: "Refresh token has expired, please log in again.",
			});
		} else if (error.name === "JsonWebTokenError") {
			return res
				.status(403)
				.json({ success: false, message: "Invalid token, authorization denied." });
		} else {
			return res.status(500).json({
				success: false,
				message: "Something went wrong with token verification.",
			});
		}
	}
});


router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: 'api/user/refresh-token' });
  res.json({ message: 'Logged out successfully' });
});

export default router;
