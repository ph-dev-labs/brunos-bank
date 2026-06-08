import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { maskCardNumber } from "@/lib/utils";

export default async function CardsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const cards = await prisma.card.findMany({ where: { userId: session.user.id } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Cards</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your debit and credit cards</p>
      </div>

      {cards.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-primary-400 mb-3">credit_card</span>
          <p className="text-gray-400">No cards yet. Cards are issued automatically on account creation.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="space-y-4">
              {/* Card visual */}
              <div className={`relative rounded-2xl p-6 text-white overflow-hidden h-48 ${
                card.type === "credit"
                  ? "bg-gradient-to-br from-purple-700 to-purple-900"
                  : "bg-gradient-to-br from-dark-600 to-dark-800 border border-dark-500"
              }`}>
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                {card.frozen && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <span className="flex items-center gap-2 text-xl"><span className="material-symbols-outlined">lock</span> Frozen</span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="font-display font-bold text-lg">Standard Chartered</span>
                  <span className="text-sm capitalize bg-white/10 px-2 py-0.5 rounded">{card.type}</span>
                </div>
                <div className="mt-8">
                  <p className="font-mono text-sm tracking-widest">{maskCardNumber(card.cardNumber)}</p>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <div>
                    <p className="text-xs text-gray-300">Card Holder</p>
                    <p className="text-sm font-medium">{card.cardHolder}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-300">Expires</p>
                    <p className="text-sm font-medium">{card.expiry}</p>
                  </div>
                </div>
              </div>

              {/* Card details */}
              <div className="card p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className={card.frozen ? "text-red-400" : "text-primary-400"}>
                    {card.frozen ? "Frozen" : "Active"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">CVV</span>
                  <span className="font-mono">•••</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Type</span>
                  <span className="capitalize">{card.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-4">
        <p className="text-xs text-gray-500 text-center">
          <span className="material-symbols-outlined text-[0.9rem] align-middle mr-1">lock</span> Your card details are encrypted. Contact support to freeze/unfreeze cards.
        </p>
      </div>
    </div>
  );
}
