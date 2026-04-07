import { Download, Check, X, Clock } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { mockPayments, mockStudents, mockExams } from '../../data/mockData';

export default function AdminPayments() {
  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Payments Management</h1>
            <p className="text-gray-600">Track and manage payments</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-lg font-semibold transition">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-black">
              {mockPayments
                .filter((p) => p.status === 'approved')
                .reduce((sum, p) => sum + p.amount, 0)}{' '}
              ETB
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Pending Payments</p>
            <p className="text-3xl font-bold text-yellow-600">
              {mockPayments.filter((p) => p.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Successful</p>
            <p className="text-3xl font-bold text-green-600">
              {mockPayments.filter((p) => p.status === 'approved').length}
            </p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockPayments.map((payment) => {
                const student = mockStudents.find((s) => s.id === payment.studentId);
                const exam = mockExams.find((e) => e.id === payment.examId);
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-black">{student?.name}</p>
                      <p className="text-sm text-gray-600">{student?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-black">{exam?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-black">{payment.amount} ETB</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-black">{payment.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          <Check className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                      {payment.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                      {payment.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                          <X className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
