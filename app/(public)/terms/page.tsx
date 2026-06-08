export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-display font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-invert prose-green max-w-none">
        <p className="text-gray-400 text-lg mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mb-4 mt-8">1. Acceptance of Terms</h2>
        <p className="text-gray-400 mb-6">
          By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the services.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">2. Description of Service</h2>
        <p className="text-gray-400 mb-6">
          Standard Chartered provides digital banking services, including but not limited to, savings accounts, money transfers, virtual cards, and loan facilities. We reserve the right to modify or discontinue any part of the service at any time.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">3. User Obligations</h2>
        <p className="text-gray-400 mb-6">
          You agree to provide true, accurate, current, and complete information about yourself as prompted by the registration form. You are responsible for maintaining the confidentiality of your account and password.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">4. Limitation of Liability</h2>
        <p className="text-gray-400 mb-6">
          In no event shall Standard Chartered be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the service.
        </p>
      </div>
    </div>
  );
}
