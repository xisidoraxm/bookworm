type InvoiceOrder = {
    id: number;
    total: number;
    createdAt: string;
    paymentMethod: string;
    deliveryMethod: string;
    user: {
        fullName: string;
        email: string;
        phone: string;
        address: string | null;
        city: string | null;
        postalCode: string | null;
    };
    items: {
        id: number;
        quantity: number;
        price: number;
        book: { title: string; author: string };
    }[];
};

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function printInvoice(order: InvoiceOrder) {
    const itemsHtml = order.items
        .map(
            (item, i) => `
            <tr>
                <td style="padding:10px 12px; border-bottom:1px solid #e8e0d8; color:#3e2c20;">${i + 1}</td>
                <td style="padding:10px 12px; border-bottom:1px solid #e8e0d8; color:#3e2c20;">${item.book.title}</td>
                <td style="padding:10px 12px; border-bottom:1px solid #e8e0d8; color:#3e2c20; text-align:center;">${item.quantity}</td>
                <td style="padding:10px 12px; border-bottom:1px solid #e8e0d8; color:#3e2c20; text-align:right;">$${item.price.toFixed(2)}</td>
                <td style="padding:10px 12px; border-bottom:1px solid #e8e0d8; color:#3e2c20; text-align:right; font-weight:600;">$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>`
        )
        .join("");

    const customerAddress = [order.user.address, order.user.city, order.user.postalCode].filter(Boolean).join(", ");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Invoice #${order.id} — Bookworm Bookstore</title>
    <style>
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body style="margin:0; padding:0; font-family:'Georgia',serif; color:#3e2c20; background:#fff;">
    <div style="max-width:680px; margin:0 auto; padding:40px 36px;">

        <!-- Header -->
        <div style="text-align:center; padding-bottom:24px; border-bottom:2px solid #c67c4e;">
            <h1 style="margin:0; font-size:26px; letter-spacing:0.08em; color:#5c4033; text-transform:uppercase;">Bookworm Bookstore</h1>
            <p style="margin:6px 0 0; font-size:13px; color:#8a7060; letter-spacing:0.04em;">Your neighborhood book haven</p>
        </div>

        <!-- Invoice title -->
        <div style="text-align:center; margin:20px 0 28px;">
            <span style="display:inline-block; background:#fdf6ef; border:1px solid #e8d5c4; border-radius:8px; padding:6px 18px; font-size:14px; font-weight:700; color:#5c4033; letter-spacing:0.04em;">INVOICE #${order.id}</span>
        </div>

        <!-- Two-column top -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:28px;">
            <tr>
                <td style="vertical-align:top; width:50%; padding-right:16px;">
                    <p style="margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a7060; font-weight:700;">Customer</p>
                    <p style="margin:0 0 3px; font-size:14px; font-weight:700;">${order.user.fullName}</p>
                    <p style="margin:0 0 3px; font-size:13px; color:#5e4a3c;">${order.user.email}</p>
                    <p style="margin:0 0 3px; font-size:13px; color:#5e4a3c;">${order.user.phone || ""}</p>
                    ${customerAddress ? `<p style="margin:0; font-size:13px; color:#5e4a3c;">${customerAddress}</p>` : ""}
                </td>
                <td style="vertical-align:top; width:50%; padding-left:16px; text-align:right;">
                    <p style="margin:0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8a7060; font-weight:700;">Invoice Details</p>
                    <p style="margin:0 0 3px; font-size:13px;"><span style="color:#8a7060;">Date:</span> ${fmtDate(order.createdAt)}</p>
                    <p style="margin:0 0 3px; font-size:13px;"><span style="color:#8a7060;">Payment:</span> ${order.paymentMethod.replace("_", " ")}</p>
                    <p style="margin:0; font-size:13px;"><span style="color:#8a7060;">Delivery:</span> ${order.deliveryMethod.charAt(0) + order.deliveryMethod.slice(1).toLowerCase()}</p>
                </td>
            </tr>
        </table>

        <!-- Separator -->
        <hr style="border:none; border-top:1px solid #e8e0d8; margin:0 0 20px;" />

        <!-- Items table -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
            <thead>
                <tr style="background:#f7efe8;">
                    <th style="padding:10px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:#7d6554; font-weight:700; border-bottom:2px solid #e0cfc2; border-radius:8px 0 0 0;">#</th>
                    <th style="padding:10px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:#7d6554; font-weight:700; border-bottom:2px solid #e0cfc2;">Book</th>
                    <th style="padding:10px 12px; text-align:center; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:#7d6554; font-weight:700; border-bottom:2px solid #e0cfc2;">Qty</th>
                    <th style="padding:10px 12px; text-align:right; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:#7d6554; font-weight:700; border-bottom:2px solid #e0cfc2;">Price</th>
                    <th style="padding:10px 12px; text-align:right; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:#7d6554; font-weight:700; border-bottom:2px solid #e0cfc2; border-radius:0 8px 0 0;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <!-- Total box -->
        <div style="display:flex; justify-content:flex-end;">
            <div style="background:#fdf6ef; border:1px solid #e0cfc2; border-radius:10px; padding:12px 24px; text-align:right;">
                <span style="font-size:13px; color:#7d6554; font-weight:600;">Order Total</span>
                <span style="display:block; margin-top:2px; font-size:22px; font-weight:700; color:#5c4033;">$${order.total.toFixed(2)}</span>
            </div>
        </div>

        <!-- Separator -->
        <hr style="border:none; border-top:1px solid #e8e0d8; margin:28px 0 20px;" />

        <!-- Footer -->
        <div style="text-align:center;">
            <p style="margin:0 0 4px; font-size:13px; color:#8a7060; font-style:italic;">Thank you for supporting independent bookstores.</p>
            <p style="margin:0; font-size:12px; color:#a89484;">Questions? Contact us at support@bookworm.com</p>
        </div>

    </div>
</body>
</html>`;

    const w = window.open("", "_blank", "width=800,height=700");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
}
