import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});



const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export default prisma;