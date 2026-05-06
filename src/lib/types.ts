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
