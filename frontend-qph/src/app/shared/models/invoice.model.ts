// src/app/shared/models/invoice.model.ts
export interface InvoiceItem {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  subtotal?: number;
}

export interface Invoice {
  id?: number;
  customerName: string;
  createdAt?: Date;
  totalAmount?: number;
  items: InvoiceItem[];
}


