export interface Product {
  _id?: string
  name: string
  description: string
  category: string
  price: number
  stock: number
  imageUrl: string
  vendorId: string
  createdAt: Date
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
  name: string
  imageUrl: string
}

export interface Order {
  _id?: string
  userId: string
  vendorId: string
  products: OrderItem[]
  status: "Pending" | "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled"
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  label: string
  address: string
  city: string
  state: string
  zip: string
}

export interface User {
  _id?: string
  username: string
  email: string
  addresses: Address[]
  orderHistory: string[] // Order IDs
  createdAt: Date
}

export interface Vendor {
  _id?: string
  businessName: string
  email: string
  address: string
  phone: string
  products: string[] // Product IDs
  createdAt: Date
}

