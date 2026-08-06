"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Trophy,
  AlertCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Clock,
  ListChecks,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Navbar = dynamic(() => import("@/components/navbar"), { ssr: false });
const Footer = dynamic(() => import("@/components/footer"), { ssr: false });

interface TestAttempt {
  id: string;
  type: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  timeSpent: number;
  completedAt: string;
  test: {
    id: string;
    title: string;
    language: string | null;
    module: string | null;
    section: string | null;
    standardSection: string | null;
    type: string;
  } | null;
  answersCount: number;
}

export default function MockTestResultPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/mock-test/results?limit=50`);
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.message || "Failed to load results");
        }

        const data = json.data;
        const attempts = Array.isArray(data) ? data : [];
        const found =
          attempts.find((a: TestAttempt) => a.id === attemptId) ||
          attempts[0] ||
          null;
        setAttempt(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchResult();
    }
  }, [attemptId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
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

  if (error || !attempt) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">
            Result not found
          </h1>
          <p className="text-muted-foreground">
            {error || "Could not locate your test result."}
          </p>
          <Link href="/mock-tests">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Mock Tests
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const percentage = Math.round(attempt.score ?? 0);
  const passed = attempt.passed;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              passed ? "bg-green-600/10" : "bg-destructive/10"
            }`}
          >
            {passed ? (
              <Trophy className="h-10 w-10 text-green-600" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {passed ? "Congratulations!" : "Test Completed"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {passed
              ? "You passed the test!"
              : "Keep practicing, you'll do better next time!"}
          </p>
          {attempt.test?.title && (
            <p className="text-sm text-muted-foreground mt-1">
              {attempt.test.title}
            </p>
          )}
        </div>

        {/* Score Summary */}
        <Card className="p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-foreground">
              {percentage}%
            </div>
            <div className="text-muted-foreground mt-2">Overall Score</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {attempt.correctAnswers ?? 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Correct</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {attempt.totalQuestions ?? 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-xl font-bold text-foreground">
                  {formatTime(attempt.timeSpent || 0)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Time</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div
                className={`text-2xl font-bold ${
                  passed ? "text-green-600" : "text-destructive"
                }`}
              >
                {passed ? "PASS" : "FAIL"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Status</div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/mock-tests">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Mock Tests
            </Button>
          </Link>
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => router.push(`/mock-tests/${params.id}`)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Test
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
