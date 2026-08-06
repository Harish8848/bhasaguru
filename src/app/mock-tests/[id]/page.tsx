"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Clock,
  ListChecks,
  Users,
  Trophy,
  ArrowLeft,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Navbar = dynamic(() => import("@/components/navbar"), { ssr: false });
const Footer = dynamic(() => import("@/components/footer"), { ssr: false });

interface MockTest {
  id: string;
  title: string;
  description: string | null;
  language: string | null;
  module: string | null;
  section: string | null;
  standardSection: string | null;
  type: string;
  duration: number;
  passingScore: number;
  questionsCount: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  allowRetake: boolean;
  createdAt: string;
  _count: {
    attempts: number;
    questions: number;
  };
}

export default function MockTestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [test, setTest] = useState<MockTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/mock-tests/${params.id}`);
        if (!response.ok) {
          throw new Error("Test not found");
        }
        const json = await response.json();
        setTest(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTest();
    }
  }, [params.id]);

  const handleStart = () => {
    if (!session) {
      router.push(`/auth?callbackUrl=/mock-tests/${params.id}`);
      return;
    }
    // Start the test - fetch questions and go to test-taking
    router.push(`/mock-tests/${params.id}/take`);
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

  if (error || !test) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Test not found</h1>
          <p className="text-muted-foreground">{error}</p>
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/mock-tests"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Mock Tests
        </Link>

        <Card className="overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    {test.type}
                  </Badge>
                  {test.language && (
                    <Badge variant="outline" className="text-xs">
                      {test.language}
                    </Badge>
                  )}
                  {test.section && (
                    <Badge variant="secondary" className="text-xs">
                      {test.section}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  {test.title}
                </h1>
              </div>
              <Trophy className="w-10 h-10 text-accent shrink-0" />
            </div>

            {test.description && (
              <p className="text-muted-foreground leading-relaxed">
                {test.description}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="flex flex-col items-center gap-1 p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">{test.duration} min</span>
                <span className="text-xs text-muted-foreground">Duration</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 bg-muted rounded-lg">
                <ListChecks className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">
                  {test.questionsCount}
                </span>
                <span className="text-xs text-muted-foreground">Questions</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 bg-muted rounded-lg">
                <Trophy className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">
                  {test.passingScore}%
                </span>
                <span className="text-xs text-muted-foreground">
                  Passing Score
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 bg-muted rounded-lg">
                <Users className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">
                  {test._count?.attempts || 0}
                </span>
                <span className="text-xs text-muted-foreground">Attempts</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              {test.module && (
                <p>
                  <span className="font-medium text-foreground">Module:</span>{" "}
                  {test.module}
                </p>
              )}
              {test.standardSection && (
                <p>
                  <span className="font-medium text-foreground">Section:</span>{" "}
                  {test.standardSection}
                </p>
              )}
              <p>
                <span className="font-medium text-foreground">
                  Shuffle Questions:
                </span>{" "}
                {test.shuffleQuestions ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-medium text-foreground">
                  Allow Retake:
                </span>{" "}
                {test.allowRetake ? "Yes" : "No"}
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button
                size="lg"
                className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={handleStart}
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Test
              </Button>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
