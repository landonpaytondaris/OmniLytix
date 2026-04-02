export default function LotPassportPage({
  params,
}: {
  params: { lotId: string };
}) {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-semibold">Lot Passport</h1>
      <p className="text-white/60 mt-2">Lot ID: {params.lotId}</p>
    </main>
  );
}
