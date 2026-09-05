import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/db.js";

export const generateJWT = (userId, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m", 
    algorithm: 'HS256',
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:  15 * 60 * 1000 // 15 minutes
  });

  return token;
}

export const generateRefreshToken = async(userId, res) => {
  const refreshToken = crypto.randomBytes(64).toString("hex");

  const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

  // Store the refresh token in the database
  await prisma.session.create({
    data: {
      userId: userId,
      refreshToken: hashedToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    }
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  return true;
}