"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Eye,
  MapPin,
  Building2,
} from "lucide-react";
import { useState, useEffect } from "react";

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
}

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];
const JOB_STATUSES = ["ACTIVE", "FILLED", "CLOSED", "EXPIRED"];
const LANGUAGE_LEVELS = [
  "BEGINNER",
  "ELEMENTARY",
  "INTERMEDIATE",
  "UPPER_INTERMEDIATE",
  "ADVANCED",
  "PROFICIENT",
];

const initialForm = {
  title: "",
  company: "",
  location: "",
  type: "FULL_TIME",
  status: "ACTIVE",
  description: "",
  requirements: "",
  languageRequired: "",
  languageLevel: "INTERMEDIATE",
  salary: "",
  currency: "",
  applicationUrl: "",
  email: "",
  expiresAt: "",
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/jobs");
      const result = await response.json();

      if (result.success) {
        setJobs(result.data?.data || []);
      } else {
        setError(result.message || "Failed to fetch jobs");
      }
    } catch (err) {
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        description: formData.description,
        requirements: formData.requirements,
        languageRequired: formData.languageRequired,
        languageLevel: formData.languageLevel,
        status: formData.status,
      };

      if (formData.salary) payload.salary = formData.salary;
      if (formData.currency) payload.currency = formData.currency;
      if (formData.applicationUrl)
        payload.applicationUrl = formData.applicationUrl;
      if (formData.email) payload.email = formData.email;
      if (formData.expiresAt) payload.expiresAt = formData.expiresAt;

      const response = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        setShowCreateDialog(false);
        setFormData(initialForm);
        fetchJobs();
      } else {
        alert(result.message || "Failed to create job");
      }
    } catch (err) {
      alert("Failed to create job");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setSaving(true);
    try {
      const payload: any = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        description: formData.description,
        requirements: formData.requirements,
        languageRequired: formData.languageRequired,
        languageLevel: formData.languageLevel,
        status: formData.status,
      };

      if (formData.salary) payload.salary = formData.salary;
      if (formData.currency) payload.currency = formData.currency;
      if (formData.applicationUrl)
        payload.applicationUrl = formData.applicationUrl;
      if (formData.email) payload.email = formData.email;
      if (formData.expiresAt) payload.expiresAt = formData.expiresAt;

      const response = await fetch(`/api/admin/jobs/${editingJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        setEditingJob(null);
        setFormData(initialForm);
        fetchJobs();
      } else {
        alert(result.message || "Failed to update job");
      }
    } catch (err) {
      alert("Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job listing?")) return;
    try {
      const response = await fetch(`/api/admin/jobs/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setJobs(jobs.filter((j) => j.id !== id));
      } else {
        alert(result.message || "Failed to delete job");
      }
    } catch (err) {
      alert("Failed to delete job");
    }
  };

  const openEdit = (job: JobListing) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      status: job.status,
      description: job.description,
      requirements: job.requirements,
      languageRequired: job.languageRequired,
      languageLevel: job.languageLevel,
      salary: job.salary || "",
      currency: job.currency || "",
      applicationUrl: job.applicationUrl || "",
      email: job.email || "",
      expiresAt: job.expiresAt
        ? new Date(job.expiresAt).toISOString().split("T")[0]
        : "",
    });
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderForm = (onSubmit: (e: React.FormEvent) => void) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Job title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, company: e.target.value }))
            }
            placeholder="Company name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="e.g. Tokyo, Japan"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace("_", " ").toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) =>
              setFormData((prev) => ({ ...prev, status: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOB_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="languageRequired">Language Required *</Label>
          <Input
            id="languageRequired"
            value={formData.languageRequired}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                languageRequired: e.target.value,
              }))
            }
            placeholder="e.g. Japanese"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Language Level</Label>
          <Select
            value={formData.languageLevel}
            onValueChange={(v) =>
              setFormData((prev) => ({ ...prev, languageLevel: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l.replace("_", " ").toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              value={formData.salary}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, salary: e.target.value }))
              }
              placeholder="e.g. 5M-8M"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={formData.currency}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currency: e.target.value }))
              }
              placeholder="e.g. JPY"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="applicationUrl">Application URL</Label>
          <Input
            id="applicationUrl"
            value={formData.applicationUrl}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                applicationUrl: e.target.value,
              }))
            }
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Contact Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="hr@company.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Expires At</Label>
        <Input
          id="expiresAt"
          type="date"
          value={formData.expiresAt}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Job description"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements *</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, requirements: e.target.value }))
          }
          placeholder="Job requirements"
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowCreateDialog(false);
            setEditingJob(null);
            setFormData(initialForm);
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingJob ? "Update Job" : "Create Job"}
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Jobs Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage job listings
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus size={18} className="mr-2" />
          Create Job
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Search */}
      <div className="max-w-sm">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className="bg-card border-border hover:border-primary/50 transition-colors flex flex-col"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-foreground text-base line-clamp-2">
                    {job.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Building2 size={14} />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={14} />
                    <span>{job.location}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                    job.status === "ACTIVE"
                      ? "bg-green-500/20 text-green-400"
                      : job.status === "FILLED"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {job.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                  {job.type.replace("_", " ")}
                </span>
                <span>{job.languageRequired}</span>
                <span>{job.languageLevel}</span>
                <span className="ml-auto">{job.viewCount} views</span>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
                  onClick={() => window.open(`/jobs/${job.id}`, "_blank")}
                >
                  <Eye size={14} className="mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
                  onClick={() => openEdit(job)}
                >
                  <Edit2 size={14} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-destructive hover:bg-destructive/10 bg-transparent"
                  onClick={() => handleDelete(job.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No jobs found. Create your first job listing!
          </p>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setFormData(initialForm);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Job Listing</DialogTitle>
          </DialogHeader>
          {renderForm(handleCreate)}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingJob}
        onOpenChange={(open) => {
          if (!open) {
            setEditingJob(null);
            setFormData(initialForm);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Listing</DialogTitle>
          </DialogHeader>
          {editingJob && renderForm(handleUpdate)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
