"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  MapPin,
  Building2,
  Briefcase,
  Clock,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  expiresAt: string | null;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const jobTypes = ["ALL", "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedType !== "ALL") params.set("type", selectedType);

        const response = await fetch(`/api/jobs?${params}`);
        const json = await response.json();
        const jobsData = json.data?.data || [];
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [selectedType]);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Job Opportunities
          </h1>
          <p className="text-muted-foreground mt-2">
            Find career opportunities in Japan
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
              placeholder="Search jobs by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 p-6 bg-accent/10 border-border text-foreground placeholder:text-muted-foreground text-base"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {jobTypes.map((type) => (
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
          Showing {filteredJobs.length} job
          {filteredJobs.length !== 1 ? "s" : ""}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No jobs found
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try a different search term."
                : "Check back soon for new opportunities."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="default" className="text-xs mb-2">
                          {job.type.replace("_", " ")}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {job.languageRequired}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {job.languageLevel}
                          </Badge>
                        </div>
                      </div>
                      <Building2 className="w-5 h-5 text-accent shrink-0" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
                        {job.title}
                      </h2>
                      <p className="text-sm text-accent font-medium">
                        {job.company}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{job.location}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{job.salary}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Briefcase size={14} />
                        <span>{job.applicationCount} applications</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{job.viewCount} views</span>
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
