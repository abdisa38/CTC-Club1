import { Link } from "react-router";
import { ArrowRight, BookOpen, Users, Wrench, Palette, Smartphone } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

const TELEGRAM_CHANNEL_URL = "https://t.me/officialCTCclub";

const learningFields = [
  {
    title: "Web Development",
    description: "Frontend and backend phases combined into one structured learning field.",
    icon: BookOpen,
  },
  {
    title: "Graphics Design",
    description: "Design-focused field covering UI/UX, branding, and visual content workflows.",
    icon: Palette,
  },
  {
    title: "App Development",
    description: "Mobile and app engineering path for Android, iOS, and cross-platform stacks.",
    icon: Smartphone,
  },
  {
    title: "Maintenance",
    description: "Maintenance field for support, QA, monitoring, and reliable operations.",
    icon: Wrench,
  },
];

export function About() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050117] text-white">
      <section className="mx-auto max-w-[1100px] px-6 py-16 lg:py-24">
        <Badge className="mb-5 border-sky-500/30 bg-sky-500/10 text-sky-300">About CTC Club</Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Build Practical Skills With Structured Learning Fields
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
          CTC Club is designed for students who want real outcomes, not just theory. We structure courses by field so learners can move
          from basics to advanced projects in a clear path.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white hover:from-sky-700 hover:to-cyan-600">
            <Link to="/courses">
              Explore Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
            <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer">
              Join Community
            </a>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 pb-20">
        <div className="grid gap-5 sm:grid-cols-2">
          {learningFields.map((field) => (
            <div
              key={field.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <field.icon className="h-6 w-6 text-sky-300" />
              <h2 className="mt-4 text-xl font-semibold">{field.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{field.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-5 w-5 text-emerald-300" />
            <div>
              <h3 className="text-lg font-semibold">Our Mission</h3>
              <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">
                Help students become job-ready by combining guided lessons, practical projects, mentor feedback, and active community support.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
