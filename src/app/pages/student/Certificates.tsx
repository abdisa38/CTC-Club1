import { useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/Dialog";
import { Award, Download, Eye, Calendar, BookOpen, Share2, ExternalLink } from "lucide-react";
import { motion } from "motion/react";

const certificates = [
  {
    id: 1, course: "Advanced React Patterns", instructor: "Prof. Sarah Jenkins",
    completedDate: "Oct 5, 2026", grade: "A+", hours: 25,
    color: "from-blue-500 to-indigo-600", skills: ["React", "Hooks", "Performance"],
    credentialId: "CTC-CERT-2026-10-001"
  },
  {
    id: 2, course: "Data Structures Mastery", instructor: "Dr. Alan Turing",
    completedDate: "May 18, 2026", grade: "A", hours: 30,
    color: "from-emerald-500 to-teal-600", skills: ["C++", "Algorithms", "DSA"],
    credentialId: "CTC-CERT-2026-05-012"
  },
  {
    id: 3, course: "UI/UX Design for Developers", instructor: "Sarah Jenkins",
    completedDate: "Mar 22, 2026", grade: "A-", hours: 12,
    color: "from-purple-500 to-pink-600", skills: ["Figma", "Design Systems", "CSS"],
    credentialId: "CTC-CERT-2026-03-008"
  },
  {
    id: 4, course: "CSS Mastery", instructor: "Prof. Michael Jordan",
    completedDate: "Jan 10, 2026", grade: "A+", hours: 15,
    color: "from-amber-500 to-orange-600", skills: ["CSS", "Flexbox", "Grid", "Animations"],
    credentialId: "CTC-CERT-2026-01-003"
  },
];

export function Certificates() {
  const [selectedCert, setSelectedCert] = useState<typeof certificates[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Certificates
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {certificates.length} certificates earned across all courses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
            <Award className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">{certificates.length} Earned</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {certificates.map((cert, i) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all hover:border-indigo-200 dark:hover:border-indigo-800 group">
              {/* Certificate Visual */}
              <div className={`h-40 bg-gradient-to-br ${cert.color} relative overflow-hidden`}>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                  <Award className="h-10 w-10 mb-2 opacity-90" />
                  <h3 className="text-lg font-bold text-center leading-tight">{cert.course}</h3>
                  <p className="text-xs opacity-80 mt-1">Certificate of Completion</p>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full" />
              </div>

              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">{cert.instructor}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">{cert.credentialId}</Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {cert.completedDate}</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {cert.hours}h</span>
                  <span className="font-semibold text-emerald-600">Grade: {cert.grade}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {cert.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0.5">{skill}</Badge>
                  ))}
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedCert(cert)}>
                        <Eye className="h-4 w-4 mr-1.5" /> View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Certificate Preview</DialogTitle>
                      </DialogHeader>
                      <div className={`aspect-[1.414] w-full bg-gradient-to-br ${cert.color} rounded-xl p-8 flex flex-col items-center justify-center text-white relative overflow-hidden`}>
                        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full" />
                        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full" />
                        <div className="relative z-10 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Award className="h-8 w-8" />
                          </div>
                          <p className="text-sm opacity-80 uppercase tracking-widest mb-2">Certificate of Completion</p>
                          <h2 className="text-3xl font-bold mb-1">CTC Club Platform</h2>
                          <p className="text-sm opacity-80 mb-6">This certifies that</p>
                          <h3 className="text-2xl font-bold mb-2">Alex Chen</h3>
                          <p className="text-sm opacity-80 mb-6">has successfully completed</p>
                          <h4 className="text-xl font-bold mb-2">{cert.course}</h4>
                          <p className="text-sm opacity-80">Grade: {cert.grade} · {cert.hours} hours · {cert.completedDate}</p>
                          <p className="text-xs opacity-60 mt-4">Instructor: {cert.instructor}</p>
                          <p className="text-xs opacity-60 font-mono mt-2">Credential ID: {cert.credentialId}</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="outline"><Share2 className="h-4 w-4 mr-2" /> Share</Button>
                        <Button><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-1.5" /> Download
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
