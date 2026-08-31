import { prisma } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

const addUser = async (req, res) => {
  const { username, password, role } = req.body;

  // Verify no user exists with the same username
  const userExists = await prisma.user.findUnique({
    where: { username },
  });

  if (userExists) {
    return res.status(400).json({ message: "Username not available" });
  }

  // Hash the password before storing it in the database
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashed,
      role
    }
  });

  // Generate JWT token
  const token = generateToken(user.id, res);

  res.status(201).json({ 
    status: "success",
    data: {
      id: user.id,
      username: user.username,
      role: user.role
    },
    token,
    message: "User created successfully"
  });
}

const login = async (req, res) => {
  const { username, password } = req.body;

  // Verify a user exists with the username
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Verify the password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = generateToken(user.id, res);

  // If we reach here, the user has successfully logged in
  res.status(201).json({ 
    status: "success",
    data: {
      id: user.id,
      username: user.username,
      role: user.role
    },
    token,
    message: "User created successfully"
  });
}

const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // Set the cookie to expire immediately
  });

  res.status(200).json({ 
    status: "success",
    message: "Logged out successfully" 
  });
}

const removeUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const userToDelete = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userToDelete) {
    return res.status(404).json({ message: "User not found" });
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  res.status(200).json({
    status: "success",
    message: "User deleted successfully"
  });
}

export { addUser, login, logout, removeUser }