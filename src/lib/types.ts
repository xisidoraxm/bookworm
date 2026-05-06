export type Book = {
    id: number;
    title: string;
    author: string;
    description: string | null;
    price: number;
    genre: string;
    coverImage: string | null;
    rating: number;
    inStock: boolean;
    quantity: number;
};

export type User = {
    id?: number;
    username?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    email?: string;
};

export type OrderItem = {
    id: number;
    quantity: number;
    price: number;
    book: {
        id: number;
        title: string;
        author: string;
        genre: string;
        coverImage: string | null;
    };
};

export type Order = {
    id: number;
    total: number;
    createdAt: string;
    items: OrderItem[];
};
