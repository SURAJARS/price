import { redirect } from 'next/navigation';

// Pricing history is integrated into the product edit page.
export default async function HistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/products/${id}/edit`);
}
