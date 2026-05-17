"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

type AdminStudentFeedbackItem = {
  id: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
  user: {
    name: string | null;
    address: string | null;
  };
};

export default function AdminStudentFeedback() {
  const [items, setItems] = useState<AdminStudentFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/student-feedback?limit=50");
      const json = await res.json();
      if (!json?.success) {
        setError(json?.message ?? "Failed to load");
        return;
      }
      setItems(json?.data?.comments ?? []);
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Delete this student feedback comment?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/student-feedback/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json?.success) {
        alert(json?.message ?? "Delete failed");
        return;
      }
      await load();
    } catch {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Student Feedback</h2>
        <button
          className="text-sm px-3 py-1 rounded border border-border hover:border-accent/50"
          onClick={load}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground border border-dashed rounded-lg p-6 text-center">
          No student feedback yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">
                    {item.user.name ?? "Student"}
                    {item.user.address ? (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        — {item.user.address}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-foreground/90 mt-2 whitespace-pre-wrap">
                    {item.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  className="p-2 rounded border border-border hover:border-accent/50 disabled:opacity-60"
                  onClick={() => onDelete(item.id)}
                  disabled={deletingId === item.id}
                  aria-label="Delete feedback"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
