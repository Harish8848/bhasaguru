"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Navbar = dynamic(() => import("@/components/navbar"), { ssr: false });
const Footer = dynamic(() => import("@/components/footer"), { ssr: false });

interface Question {
  id: string;
  type: string;
  questionText: string;
  audioUrl: string | null;
  imageUrl: string | null;
  options: any;
  points: number;
  explanation: string | null;
}

interface TestInfo {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  questionsCount: number;
  passingScore: number;
  language: string | null;
  module: string | null;
  section: string | null;
  standardSection: string | null;
  type: string;
}

interface StartResponse {
  questions: Question[];
  test: TestInfo;
  totalQuestions: number;
}

export default function MockTestTakePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [test, setTest] = useState<TestInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startTest = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/mock-test/start?testId=${params.id}`
        );
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.message || "Failed to start test");
        }

        const data: StartResponse = json.data;
        setQuestions(data.questions || []);
        setTest(data.test || null);
        setTimeLeft((data.test?.duration || 0) * 60);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test");
      } finally {
        setLoading(false);
      }
    };

    if (params.id && status === "authenticated") {
      startTest();
    }
  }, [params.id, status]);

  useEffect(() => {
    if (timeLeft <= 0 || submitting) return;
    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, submitting]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const timeSpent = (test?.duration || 0) * 60 - timeLeft;

      const response = await fetch(`/api/mock-test/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questions.map((q) => ({
            questionId: q.id,
            selectedOption:
              typeof answers[q.id] === "string" ? answers[q.id] : undefined,
            textAnswer:
              typeof answers[q.id] === "string" ? undefined : answers[q.id],
            timeSpent: Math.max(1, Math.floor(timeSpent / questions.length)),
            timestamp: new Date(),
          })),
          timeSpent: Math.max(1, timeSpent),
          testId: params.id,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || "Failed to submit test");
      }

      router.push(
        `/mock-tests/${params.id}/result?attemptId=${json.data.attemptId}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit test");
      setSubmitting(false);
    }
  }, [submitting, answers, questions, test, timeLeft, params.id, router]);

  if (status === "loading" || (loading && status === "authenticated")) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">
            Authentication required
          </h1>
          <p className="text-muted-foreground">
            Please sign in to take this test.
          </p>
          <Button
            onClick={() =>
              router.push(`/auth?callbackUrl=/mock-tests/${params.id}`)
            }
          >
            Sign In
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => router.push("/mock-tests")}>
            Back to Mock Tests
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">
            No questions available
          </h1>
          <p className="text-muted-foreground">
            This test has no questions yet.
          </p>
          <Button variant="outline" onClick={() => router.push("/mock-tests")}>
            Back to Mock Tests
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {test?.title || "Mock Test"}
          </h1>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                timeLeft < 60 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div
            className="bg-accent h-2 rounded-full transition-all"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <Card className="p-6 mb-6">
          <div className="space-y-6">
            {currentQuestion.imageUrl && (
              <img
                src={currentQuestion.imageUrl}
                alt="Question"
                className="w-full max-h-64 object-contain rounded-lg bg-muted"
              />
            )}
            {currentQuestion.audioUrl && (
              <audio
                src={currentQuestion.audioUrl}
                controls
                className="w-full"
              />
            )}
            <h2 className="text-lg font-medium text-foreground leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            {Array.isArray(currentQuestion.options) ? (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) =>
                  handleAnswer(currentQuestion.id, value)
                }
                className="space-y-3"
              >
                {currentQuestion.options.map((option: any, idx: number) => {
                  const value =
                    typeof option === "string"
                      ? option
                      : option?.text || option?.value || String(option);
                  return (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/5 cursor-pointer"
                    >
                      <RadioGroupItem value={value} id={`option-${idx}`} />
                      <Label
                        htmlFor={`option-${idx}`}
                        className="cursor-pointer flex-1"
                      >
                        {typeof option === "string"
                          ? option
                          : option?.text || option?.label || value}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : (
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleAnswer(currentQuestion.id, e.target.value)
                }
                placeholder="Type your answer here..."
                rows={5}
              />
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Test
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() =>
                setCurrentIndex((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
