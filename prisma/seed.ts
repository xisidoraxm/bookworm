import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const books = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan, set in the Jazz Age on Long Island.",
    price: 12.99,
    genre: "Classic",
    rating: 4.5,
    inStock: true,
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A gripping tale of racial injustice and childhood innocence in the American South during the 1930s.",
    price: 14.99,
    genre: "Classic",
    rating: 4.8,
    inStock: true,
  },
  {
    title: "1984",
    author: "George Orwell",
    description: "A dystopian novel set in a totalitarian society ruled by Big Brother, exploring themes of surveillance and control.",
    price: 11.99,
    genre: "Dystopian",
    rating: 4.7,
    inStock: true,
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A witty romance about Elizabeth Bennet and Mr. Darcy navigating society, class, and their own pride.",
    price: 10.99,
    genre: "Romance",
    rating: 4.6,
    inStock: true,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description: "Bilbo Baggins embarks on an unexpected journey with a company of dwarves to reclaim their homeland.",
    price: 15.99,
    genre: "Fantasy",
    rating: 4.7,
    inStock: true,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    description: "An epic saga of politics, religion, and ecology on the desert planet Arrakis.",
    price: 16.99,
    genre: "Science Fiction",
    rating: 4.6,
    inStock: false,
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    description: "The story of Holden Caulfield's experiences in New York City after being expelled from prep school.",
    price: 11.49,
    genre: "Classic",
    rating: 4.1,
    inStock: true,
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    description: "A futuristic society where humans are engineered and conditioned for a seemingly perfect existence.",
    price: 13.49,
    genre: "Dystopian",
    rating: 4.4,
    inStock: true,
  },
];

async function main() {
  console.log("Seeding books...");

  for (const book of books) {
    await prisma.book.create({ data: book });
  }

  console.log(`Seeded ${books.length} books.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
