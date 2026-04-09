import { Clock, FileText, Gamepad2, Lock } from "lucide-react";
import { Link } from "react-router";

export interface ExamCardData {
  id: string;
  name: string;
  topic?: string;
  category?: string;
  totalQuestions?: number;
  duration?: number;
  isPremium?: boolean;
  hasGamingMode?: boolean;
}

interface ExamCardProps {
  exam: ExamCardData;
  showActions?: boolean;
}

export default function ExamCard({ exam, showActions = true }: ExamCardProps) {
  const categoryColors: Record<string, string> = {
    "Grade 6": "bg-blue-100 text-blue-800",
    "Grade 8": "bg-green-100 text-green-800",
    "Grade 12": "bg-purple-100 text-purple-800",
    "Model Exam": "bg-yellow-100 text-yellow-800",
    "Exit Exam": "bg-red-100 text-red-800",
    "Mock Exam": "bg-pink-100 text-pink-800",
  };

  const category = exam.category || "General";
  const totalQuestions = Number.isFinite(exam.totalQuestions) ? exam.totalQuestions : 0;
  const duration = Number.isFinite(exam.duration) ? exam.duration : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[category] || "bg-slate-100 text-slate-700"}`}>
          {category}
        </span>
        {exam.hasGamingMode ? (
          <div className="flex items-center gap-1 text-primary text-xs">
            <Gamepad2 className="w-4 h-4" />
            <span>Gaming</span>
          </div>
        ) : null}
      </div>

      <h3 className="text-lg font-semibold mb-2 text-black">{exam.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{exam.topic || "Live exam content"}</p>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          <span>{totalQuestions} Questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{duration} min</span>
        </div>
      </div>

      {exam.isPremium ? (
        <div className="flex items-center gap-1 text-yellow-600 text-sm mb-4">
          <Lock className="w-4 h-4" />
          <span>Premium Required</span>
        </div>
      ) : null}

      {showActions ? (
        <Link
          to="/app/quizzes"
          className="block w-full px-4 py-3 bg-primary hover:bg-red-700 text-white rounded-lg text-center font-semibold transition"
        >
          Open Quiz Center
        </Link>
      ) : null}
    </div>
  );
}
