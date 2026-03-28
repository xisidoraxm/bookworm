import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function clean() {
  const books = await prisma.book.findMany();
  const seen = new Map<string, number>();
  const toDelete: number[] = [];

  for (const b of books) {
    if (seen.has(b.title)) {
      toDelete.push(b.id);
    } else {
      seen.set(b.title, b.id);
    }
  }

  if (toDelete.length > 0) {
    await prisma.book.deleteMany({ where: { id: { in: toDelete } } });
    console.log(`Deleted ${toDelete.length} duplicate books`);
  } else {
    console.log("No duplicates found");
  }

  await prisma.$disconnect();
}

clean();
