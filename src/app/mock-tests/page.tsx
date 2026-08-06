"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Clock,
  ListChecks,
  Users,
  Trophy,
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
  createdAt: string;
  _count: {
    attempts: number;
    questions: number;
  };
}

interface ListResponse {
  data: MockTest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function MockTestsPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const types = [
    "ALL",
    "PRACTICE",
    "FINAL",
    "CERTIFICATION",
    "LISTENING",
    "READING",
    "SPEAKING",
    "WRITING",
  ];

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedType !== "ALL") params.set("type", selectedType);

        const response = await fetch(`/api/mock-tests?${params}`);
        const json = await response.json();
        const testsData = json.data?.data || [];
        setTests(Array.isArray(testsData) ? testsData : []);
      } catch (err) {
        console.error("Error fetching mock tests:", err);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [selectedType]);

  const filteredTests = tests.filter(
    (test) =>
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mock Tests</h1>
          <p className="text-muted-foreground mt-2">
            Practice and assess your Japanese language proficiency
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-4 mb-6 max-w-xl mx-auto">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              placeholder="Search mock tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 p-6 bg-accent/10 border-border text-foreground placeholder:text-muted-foreground text-base"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {types.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-muted-foreground">
          Showing {filteredTests.length} test
          {filteredTests.length !== 1 ? "s" : ""}
        </div>

        {/* Empty State */}
        {filteredTests.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No mock tests found
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try a different search term."
                : "Check back soon for new tests."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <Link key={test.id} href={`/mock-tests/${test.id}`}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="default" className="text-xs mb-2">
                          {test.type}
                        </Badge>
                        <div className="flex items-center gap-2">
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
                      </div>
                      <Trophy className="w-5 h-5 text-accent shrink-0" />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
                        {test.title}
                      </h2>
                      {test.description && (
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {test.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{test.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ListChecks size={14} />
                        <span>{test.questionsCount} questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{test._count?.attempts || 0} attempts</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
