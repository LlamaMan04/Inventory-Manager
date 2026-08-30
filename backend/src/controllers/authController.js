import { prisma } from "../config/db.js";
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

  res.status(201).json({ 
    status: "success",
    data: {
      id: user.id,
      username: user.username,
      role: user.role
    },
    message: "User created successfully"
  });
}

const login = async (req, res) => {
  res.json({ message: "Login endpoint is working!" });
}

export { addUser, login }