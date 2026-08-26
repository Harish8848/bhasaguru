"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Loader2,
  MapPin,
  Building2,
  Briefcase,
  Clock,
  Eye,
  ArrowLeft,
  AlertCircle,
  DollarSign,
  FileText,
  Send,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Navbar = dynamic(() => import("@/components/navbar"), { ssr: false });
const Footer = dynamic(() => import("@/components/footer"), { ssr: false });

interface JobListing {
  id: string;
  slug: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  description: string;
  requirements: string;
  languageRequired: string;
  languageLevel: string;
  salary: string | null;
  currency: string | null;
  applicationUrl: string | null;
  email: string | null;
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  expiresAt: string | null;
  source?: "adzuna" | "remoteok" | "db";
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [formData, setFormData] = useState({
    resumeUrl: "",
    coverLetter: "",
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${params.id}`);
        if (!response.ok) {
          throw new Error("Job not found");
        }
        const json = await response.json();
        setJob(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push(`/auth?callbackUrl=/jobs/${params.id}`);
      return;
    }

    try {
      setApplying(true);
      const response = await fetch(`/api/jobs/${params.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeUrl: formData.resumeUrl || null,
          coverLetter: formData.coverLetter || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to apply");
        return;
      }

      setApplied(true);
      setShowApplyForm(false);
      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Apply error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setApplying(false);
    }
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

  if (error || !job) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Job not found</h1>
          <p className="text-muted-foreground">{error}</p>
          <Link href="/jobs">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExternal = job.source === "adzuna" || job.source === "remoteok";
  const sourceLabel = job.source === "adzuna" ? "Adzuna" : job.source === "remoteok" ? "RemoteOK" : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <Card className="overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    {job.type.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {job.languageRequired}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {job.languageLevel}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  {job.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-accent">
                    <Building2 size={16} />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={16} />
                    {job.location}
                  </span>
                </div>
              </div>
              {job.salary && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg shrink-0">
                  <DollarSign className="h-5 w-5 text-accent" />
                  <div>
                    <span className="text-lg font-semibold text-foreground">
                      {job.salary}
                    </span>
                    {job.currency && (
                      <span className="text-xs text-muted-foreground ml-1">
                        {job.currency}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="flex flex-col items-center gap-1 p-3 bg-muted rounded-lg">
                <Briefcase className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">
                  {job.applicationCount}
                </span>
                <span className="text-xs text-muted-foreground">
                  Applications
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 bg-muted rounded-lg">
                <Eye className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">{job.viewCount}</span>
                <span className="text-xs text-muted-foreground">Views</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">
                  {formatDate(job.createdAt)}
                </span>
                <span className="text-xs text-muted-foreground">Posted</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">
                  {job.expiresAt ? formatDate(job.expiresAt) : "N/A"}
                </span>
                <span className="text-xs text-muted-foreground">Expires</span>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Job Description
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Requirements
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              {isExternal && job.applicationUrl ? (
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button
                    size="lg"
                    className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Apply on {sourceLabel || "External Site"}
                  </Button>
                </a>
              ) : applied ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-600/10 rounded-lg p-4">
                  <Send className="h-5 w-5" />
                  <span className="font-medium">
                    You have applied for this position. Good luck!
                  </span>
                </div>
              ) : showApplyForm ? (
                <form
                  onSubmit={handleApply}
                  className="space-y-4 bg-muted p-6 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    Apply for this position
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="resumeUrl">Resume URL</Label>
                    <Input
                      id="resumeUrl"
                      value={formData.resumeUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          resumeUrl: e.target.value,
                        }))
                      }
                      placeholder="Link to your resume/CV (Google Drive, Dropbox, etc.)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter</Label>
                    <Textarea
                      id="coverLetter"
                      value={formData.coverLetter}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          coverLetter: e.target.value,
                        }))
                      }
                      placeholder="Write a short cover letter..."
                      rows={5}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={applying}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {applying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowApplyForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  size="lg"
                  className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => {
                    if (!session) {
                      router.push(`/auth?callbackUrl=/jobs/${params.id}`);
                      return;
                    }
                    setShowApplyForm(true);
                  }}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
