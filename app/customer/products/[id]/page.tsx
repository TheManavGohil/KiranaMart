import { getProductById } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

interface ProductPageProps {
  params: { id: string }
}

function toPlainProduct(product: any) {
  return {
    ...product,
    _id: product._id?.toString(),
    vendorId: product.vendorId?.toString(),
    manufacturingDate: product.manufacturingDate ? new Date(product.manufacturingDate).toISOString() : undefined,
    expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString() : undefined,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : undefined,
    updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined,
    // Remove __v if present
    ...(product.__v !== undefined ? {} : { __v: undefined }),
  };
}

export default async function ProductDetailPage(props: Promise<ProductPageProps>) {
  const { params } = await props;
  const product = await getProductById(params.id);
  if (!product) notFound();
  const plainProduct = toPlainProduct(product);
  return <ProductDetailClient product={plainProduct} />;
} 