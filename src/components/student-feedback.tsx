"use client";

import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";

type StudentFeedbackItem = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    address: string | null;
  };
};

export default function StudentFeedbackSection() {
  const [items, setItems] = useState<StudentFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student-feedback?limit=12");
      const json = await res.json();
      if (json?.success && Array.isArray(json?.data?.comments)) {
        setItems(json.data.comments);
      }
    } catch {
      setError("Failed to load student feedback");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (trimmed.length < 3) {
      setError("Please write a comment (min 3 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/student-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      const json = await res.json();
      if (!json?.success) {
        setError(json?.message ?? "Unable to submit feedback");
        return;
      }

      setContent("");
      // New items are auto-published
      await load();
    } catch {
      setError("Unable to submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-20 md:py-32 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-10">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            What our <span className="text-accent">student says</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Enrolled learners share their learning experience. Submit your
            comment after enrollment.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 md:gap-6 mb-10">
              {items.length === 0 ? (
                <div className="md:col-span-2 text-center text-muted-foreground py-10 border border-dashed rounded-lg">
                  No approved feedback yet.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 rounded-lg border border-border hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {item.user.name ?? "Student"}
                        </p>
                        {item.user.address ? (
                          <p className="text-sm text-muted-foreground">
                            {item.user.address}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-4 text-sm md:text-base text-foreground/90 leading-relaxed">
                      “{item.content}”
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="border border-border rounded-lg p-6 bg-background">
              <h3 className="text-xl font-semibold">Add your comment</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your feedback will be submitted for approval.
              </p>

              <form onSubmit={onSubmit} className="mt-4 space-y-4">
                <div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full min-h-110px resize-none px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder="Write your comment..."
                  />
                </div>

                {error ? <p className="text-sm text-red-500">{error}</p> : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Submit
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
