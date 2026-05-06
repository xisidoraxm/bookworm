# Bookworm — Online Book Shop

A full-featured online bookshop built with **Next.js** (App Router), **Prisma** (PostgreSQL), **Bootstrap 5**, and **Google Maps**. Users can browse, search, and purchase books, manage a personal library, track reading progress, write reviews, and maintain a wishlist.

---

## Tech Stack

- **Frontend:** Next.js 15, React 18, Bootstrap 5, CSS Modules
- **Backend:** Next.js API Routes (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** localStorage-based session (username/password)
- **Cart:** Client-side persistence via localStorage
- **Maps:** Google Maps JavaScript API
- **Notifications:** react-toastify

---

## Pages & Features

### Discover (`/`)
- Hero banner with book and genre counts
- Curated collections: Bestsellers, New Arrivals, Classics, Great Reads Under $12, Staff Picks
- Genre chip links for quick filtering
- Book cards linking to detail pages

### Home (`/home`)
- Alternative storefront with a hero banner and filterable/sortable book grid

### Browse Books (`/browse`)
- Full catalog with text search (title/author), genre filter, sort options (newest, price, rating, title), minimum rating filter, and in-stock toggle
- Pagination with configurable items per page (12/24/48)
- Quick "Add to Cart" from book cards
- Collapsible sidebar for filters

### Book Detail (`/book/[id]`)
- Cover image, genre/top-rated tags, star rating, price, and stock status
- Buy box with quantity stepper and stock awareness
- Full description and Wikipedia link (if available)
- Book interactions panel (wishlist, reading status, reviews)
- Suggested books in the same genre

### Shopping Cart (`/cart`)
- Cart items with cover, title, author, price, quantity stepper, and remove button
- Summary sidebar with subtotal, total items, clear cart, and checkout
- Checkout creates an order via the API

### Login (`/login`)
- Username and password form with password visibility toggle
- Toast notifications for success/error
- Link to register page

### Register (`/register`)
- Registration form: full name, username, email, phone, password
- Client-side password validation (8+ chars, uppercase, digit, special character)
- Password visibility toggle and toast notifications

### Profile (`/profile`)
- View and edit user details (username, full name, email, phone, password)
- Inline edit mode with save/cancel

### Dashboard (`/dashboard`)
- Stats cards: total orders, books purchased, genres explored, unique authors
- Currently reading section with progress bars
- Recent books from orders
- Wishlist preview
- Reading insights (top genre, finished count, want-to-read count)

### My Books (`/my-books`)
- De-duplicated library of all purchased books
- Search by title/author, genre filter, sort by recent/title/author/genre

### Purchases (`/purchases`)
- Purchase history with summary bar (total orders, books, amount spent)
- Year filter and sort direction
- Expandable order accordion showing individual items

### Newsletter (`/newsletter`)
- Static list of curated news articles (staff picks, author events, reading lists)

### Contact (`/contact`)
- Bookshop info: address, phone, email, working hours
- Embedded Google Maps with a pin marker on the shop location (Belgrade)

---

## Components

| Component | Description |
|---|---|
| **Nav** | Responsive Bootstrap navbar with conditional links for logged-in/logged-out users, cart badge, and profile dropdown |
| **BookInteractions** | Wishlist toggle, reading status dropdown with progress slider, and review system (star rating + text) |
| **AddToCartButton** | Stock-aware add-to-cart with quantity stepper; disables when out of stock |
| **CartContext** | React Context provider managing cart state in localStorage |
| **Map** | Reusable Google Maps wrapper component |
| **GoogleMapsLoader** | Global Google Maps API loader |

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/login` | Authenticate user by username and password |
| `POST` | `/api/register` | Register a new user account |
| `PUT` | `/api/profile` | Update user profile details |
| `GET` | `/api/orders?username=` | Fetch all orders for a user with book details |
| `POST` | `/api/orders` | Place a new order (checkout) |
| `GET` | `/api/reviews?bookId=` | Get all reviews for a book |
| `POST` | `/api/reviews` | Submit or update a review (one per user per book); recalculates book average rating |
| `GET` | `/api/wishlist?username=&bookId=` | Check if a book is wishlisted |
| `POST` | `/api/wishlist` | Toggle wishlist status for a book |
| `GET` | `/api/reading-status?username=&bookId=` | Get reading status and progress for a book |
| `POST` | `/api/reading-status` | Set or update reading status (want-to-read, currently-reading, finished) |
| `DELETE` | `/api/reading-status` | Remove a reading status entry |
| `GET` | `/api/user-activity?username=` | Get full wishlist and reading statuses for dashboard |

---

## Database Models

- **User** — id, username, password, fullName, phone, email, timestamps
- **Book** — id, title, author, description, fullDescription, wikipediaUrl, price, genre, coverImage, rating, inStock, quantity, timestamps
- **Order** — id, userId, total, createdAt
- **OrderItem** — id, orderId, bookId, quantity, price
- **Review** — id, userId, bookId, rating, text, helpful, timestamps (unique per user+book)
- **Wishlist** — id, userId, bookId, createdAt (unique per user+book)
- **ReadingStatus** — id, userId, bookId, status, progress, timestamps (unique per user+book)

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up the database (configure DATABASE_URL in .env)
npx prisma migrate dev

# Seed the database
npx ts-node prisma/seed.ts

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`.
