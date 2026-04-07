import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { CreditCard, Check, X, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { mockExams } from '../../data/mockData';

export default function PaymentPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = mockExams.find((e) => e.id === examId);

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'approved' | 'failed'>('pending');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus('processing');

    // Simulate payment processing
    setTimeout(() => {
      // For demo, randomly approve or fail
      const success = Math.random() > 0.2;
      setPaymentStatus(success ? 'approved' : 'failed');
    }, 2000);
  };

  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isLoggedIn={true} userRole="student" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">Exam not found</p>
            <Link
              to="/student/exams"
              className="inline-block px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg transition"
            >
              Browse Exams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'approved') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isLoggedIn={true} userRole="student" />
        <main className="flex-1 py-8 flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-black mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                You now have access to Gaming Mode for {exam.name}
              </p>
              <div className="space-y-3">
                <Link
                  to={`/student/exam/${exam.id}/gaming`}
                  className="block w-full px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Start Gaming Mode
                </Link>
                <Link
                  to="/student/exams"
                  className="block w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-semibold transition"
                >
                  Back to Exams
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isLoggedIn={true} userRole="student" />
        <main className="flex-1 py-8 flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-black mb-2">Payment Failed</h1>
              <p className="text-gray-600 mb-6">
                There was an issue processing your payment. Please try again.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentStatus('pending')}
                  className="block w-full px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Try Again
                </button>
                <Link
                  to="/student/exams"
                  className="block w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-semibold transition"
                >
                  Back to Exams
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={true} userRole="student" />

      <main className="flex-1 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            to="/student/exams"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Exams
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Exam</p>
                  <p className="font-semibold text-black">{exam.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Feature</p>
                  <p className="font-semibold text-black">Gaming Mode Access</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-black">Total</p>
                    <p className="text-2xl font-bold text-primary">200 ETB</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Gaming Mode gives you access to competitive gameplay, leaderboards, and special badges.
                </p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">Payment via Chapa</h2>
                  <p className="text-sm text-gray-600">Secure payment gateway</p>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+251 9XX XXX XXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={paymentStatus === 'processing'}
                    className="w-full px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentStatus === 'processing' ? 'Processing...' : 'Pay 200 ETB'}
                  </button>
                </div>

                <p className="text-xs text-center text-gray-500">
                  By proceeding, you agree to Ofijan's Terms of Service
                </p>
              </form>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Accepted Payment Methods:</p>
                <div className="flex gap-2">
                  <div className="px-3 py-2 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                    Telebirr
                  </div>
                  <div className="px-3 py-2 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                    CBE Birr
                  </div>
                  <div className="px-3 py-2 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                    M-Pesa
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
