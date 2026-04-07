import { Clock, FileText, Gamepad2, Lock } from "lucide-react";
import Link from "next/link";
import { Exam } from "../data/mockData";

interface ExamCardProps {
  exam: Exam;
  showActions?: boolean;
}

export default function ExamCard({
  exam,
  showActions = true,
}: ExamCardProps) {
  const categoryColors: Record<string, string> = {
    "Grade 6": "bg-blue-100 text-blue-800",
    "Grade 8": "bg-green-100 text-green-800",
    "Grade 12": "bg-purple-100 text-purple-800",
    "Model Exam": "bg-yellow-100 text-yellow-800",
    "Exit Exam": "bg-red-100 text-red-800",
    "Mock Exam": "bg-pink-100 text-pink-800",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary">
      {/* Category Badge */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[exam.category]}`}
        >
          {exam.category}
        </span>
        {exam.hasGamingMode && (
          <div className="flex items-center gap-1 text-primary text-xs">
            <Gamepad2 className="w-4 h-4" />
            <span>Gaming</span>
          </div>
        )}
      </div>

      {/* Exam Info */}
      <h3 className="text-lg font-semibold mb-2 text-black">
        {exam.name}
      </h3>
      <p className="text-sm text-gray-600 mb-4">{exam.topic}</p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          <span>{exam.totalQuestions} Questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{exam.duration} min</span>
        </div>
      </div>

      {/* Premium Badge */}
      {exam.isPremium && (
        <div className="flex items-center gap-1 text-yellow-600 text-sm mb-4">
          <Lock className="w-4 h-4" />
          <span>Premium Required</span>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <Link
          to={`/student/exam/${exam.id}/select-mode`}
          className="block w-full px-4 py-3 bg-primary hover:bg-red-700 text-white rounded-lg text-center font-semibold transition"
        >
          Start Exam
        </Link>
      )}
    </div>
  );
}