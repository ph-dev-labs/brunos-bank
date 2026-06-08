export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-display font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-invert prose-green max-w-none">
        <p className="text-gray-400 text-lg mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mb-4 mt-8">1. Information We Collect</h2>
        <p className="text-gray-400 mb-6">
          We collect information that you provide directly to us when you create an account, verify your identity, or communicate with us. This includes your name, email address, phone number, and government-issued identification.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">2. How We Use Your Information</h2>
        <p className="text-gray-400 mb-6">
          We use the information we collect to provide, maintain, and improve our services. We also use it to process transactions, send notifications, and prevent fraud.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">3. Information Sharing</h2>
        <p className="text-gray-400 mb-6">
          We do not sell your personal information. We may share information with third-party vendors, service providers, and partners who need access to such information to carry out work on our behalf.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">4. Security</h2>
        <p className="text-gray-400 mb-6">
          We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. We use encryption for data in transit and at rest.
        </p>
      </div>
    </div>
  );
}
