import { ArrowRight, BookOpen, Check, Globe2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const languages = [
  { native: "日本語", name: "Japanese", level: "JLPT preparation", color: "bg-rose-100 text-rose-700" },
  { native: "한국어", name: "Korean", level: "TOPIK preparation", color: "bg-sky-100 text-sky-700" },
  { native: "EN", name: "English", level: "Everyday fluency", color: "bg-amber-100 text-amber-700" },
];

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f8fafc]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_15%,rgba(20,184,166,0.13),transparent_35%),radial-gradient(ellipse_at_5%_90%,rgba(99,102,241,0.09),transparent_35%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3.5 py-2 text-sm font-semibold text-teal-800 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Your next chapter starts with a new language
          </div>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.08]">
            Learn a language. <span className="text-teal-700">Open a world</span> of opportunity.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Build practical Japanese, Korean, and English skills with supportive teachers, focused lessons, and a clear path toward your goals.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-xl bg-teal-700 px-6 text-base text-white shadow-lg shadow-teal-900/15 hover:bg-teal-800">
              <Link href="/courses">Explore courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-slate-300 bg-white/80 px-6 text-base text-slate-700 hover:bg-white">
              <Link href="/lessons"><BookOpen className="mr-2 h-4 w-4" /> Browse lessons</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-teal-100 text-teal-700"><Check className="h-3.5 w-3.5" /></span>Learn at your pace</span>
            <span className="inline-flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-teal-100 text-teal-700"><Check className="h-3.5 w-3.5" /></span>Real-world skills</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div aria-hidden="true" className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-teal-200/60 via-sky-100/50 to-indigo-200/60 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-teal-700">Find your starting point</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Choose your language</h2>
              </div>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Globe2 className="h-5 w-5" /></div>
            </div>
            <div className="mt-6 space-y-3">
              {languages.map((language) => (
                <Link key={language.name} href="/courses" className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-teal-300 hover:bg-teal-50/60">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-bold ${language.color}`}>{language.native}</span>
                  <span className="min-w-0 flex-1"><span className="block font-semibold text-slate-900">{language.name}</span><span className="mt-0.5 block text-sm text-slate-500">{language.level}</span></span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-700" />
                </Link>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div><p className="text-sm font-semibold text-slate-800">Learning that leads somewhere</p><p className="mt-0.5 text-xs text-slate-500">Explore study and career opportunities</p></div>
              <Link href="/jobs" aria-label="Explore job opportunities" className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-600 shadow-sm transition hover:text-teal-700"><ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl sm:flex">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-xl">🎓</span>
            <span><span className="block text-sm font-bold text-slate-900">Learn with confidence</span><span className="text-xs text-slate-500">One lesson at a time</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}
