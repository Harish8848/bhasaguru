"use client";
import { BookOpen, Users, Clock, Loader2, Search, AlertCircle, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  level: string;
  thumbnail: string | null;
  duration: number | null;
  lessonsCount: number;
  studentsCount: number;
  publishedAt: string | null;
  isEnrolled?: boolean;
}

export default function CoursesSection() {
  const router = useRouter();
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Japanese");
  const [searchQuery, setSearchQuery] = useState("");

  const handleEnroll = async (course: Course) => {
    if (!session) {
      router.push('/auth');
      return;
    }

    try {
      setEnrollingCourseId(course.id);
      const response = await fetch(`/api/courses/${course.id}/enroll`, {
        method: "POST",
      });
      
      const result = await response.json();
      
      if (result.error === "profile_incomplete") {
        setShowProfileAlert(true);
        setTimeout(() => {
          setShowProfileAlert(false);
          router.push('/profile');
        }, 2000);
        return;
      }
      
      if (!response.ok) {
        alert(result.error || "Failed to enroll");
        return;
      }
      
      // Refresh courses from API to get updated enrollment status
      const params = new URLSearchParams();
      params.append("language", "Japanese");
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const url = `/api/courses${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      setLoading(true);
      const coursesResponse = await fetch(url);
      const coursesResult = await coursesResponse.json();

      if (coursesResult.courses) {
        setCourses(coursesResult.courses.slice(0, 6));
      }
      setLoading(false);
      
      alert("Successfully enrolled! Start learning now.");
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleContinueLearning = (course: Course) => {
    router.push(`/courses/${course.slug}`);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("language", "Japanese");
        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const url = `/api/courses${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.courses) {
          setCourses(result.courses.slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <>
      {showProfileAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top">
          <AlertCircle className="h-5 w-5" />
          <span>Please complete your profile first to enroll!</span>
        </div>
      )}

      <section className="py-12 md:py-12 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="max-w-xl mx-auto">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={20}
                  />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-input border-border text-foreground placeholder:text-muted-foreground text-base"
                  />
                </div>
              </div>

                          </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : courses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    className="border-border hover:shadow-lg transition-shadow group cursor-pointer overflow-hidden"
                  >
                    <div className="aspect-video bg-muted overflow-hidden relative">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full bg-center bg-cover object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="text-xs">
                          {course.level}
                        </Badge>
                      </div>
                      {course.isEnrolled && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="default" className="bg-green-600 text-white text-xs">
                            Enrolled
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {course.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{course.lessonsCount} lessons</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{course.studentsCount} students</span>
                          </div>
                        </div>
                        {course.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{course.duration}h</span>
                          </div>
                        )}
                      </div>

                      {course.isEnrolled ? (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleContinueLearning(course)}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                          onClick={() => handleEnroll(course)}
                          disabled={enrollingCourseId === course.id}
                        >
                          {enrollingCourseId === course.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            "Enroll Now"
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No courses available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
