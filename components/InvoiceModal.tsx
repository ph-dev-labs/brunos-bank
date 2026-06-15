import { useCurrency } from "./CurrencyProvider";
import { formatDate } from "@/lib/utils";

export default function InvoiceModal({ transaction, onClose }: { transaction: any, onClose: () => void }) {
  const { formatCurrency } = useCurrency();

  if (!transaction) return null;

  const isDeposit = transaction.type === "deposit";
  const isTransfer = transaction.type === "transfer";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white text-gray-900 rounded-xl w-full max-w-md shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-dark-900 p-6 text-center border-b border-dark-800">
          <div className="flex justify-center mb-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide">Strantchar</h2>
          <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Transaction Receipt</p>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Amount</p>
            <p className={`text-4xl font-bold ${isDeposit ? "text-green-600" : "text-gray-900"}`}>
              {isDeposit ? "+" : "-"}{formatCurrency(transaction.amount)}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              Status: <span className={`uppercase ${transaction.status === "completed" ? "text-green-600" : transaction.status === "failed" ? "text-red-600" : "text-amber-600"}`}>{transaction.status.replace("_", " ")}</span>
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-medium">Date</span>
              <span className="font-semibold text-gray-900">{formatDate(transaction.createdAt)}</span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-medium">Transaction ID</span>
              <span className="font-mono text-gray-900 text-xs">{transaction.id}</span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-500 font-medium">Description</span>
              <span className="font-semibold text-gray-900">{transaction.description || "N/A"}</span>
            </div>

            {isTransfer && transaction.externalBank && (
              <>
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="text-gray-500 font-medium">Destination Bank</span>
                  <span className="font-semibold text-gray-900">{transaction.externalBank}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="text-gray-500 font-medium">Account Name</span>
                  <span className="font-semibold text-gray-900">{transaction.externalAccountName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="text-gray-500 font-medium">Account No.</span>
                  <span className="font-mono text-gray-900">{transaction.externalAccountNumber}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 flex gap-3 border-t border-gray-200">
          <button onClick={() => window.print()} className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[1.1rem]">print</span> Print
          </button>
          <button onClick={onClose} className="flex-1 bg-dark-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-dark-800 transition-colors">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
