"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap } from "lucide-react";

export type CourseBasic = {
  id: string;
  title: string;
  language: string;
  level: string;
};

export type EnrollmentBasic = {
  id: string;
  progressPercent: number;
  completedLessons: number;
  course: CourseBasic;
};

export function ProfileEnrolledCourses({
  enrollments,
  className,
}: {
  enrollments?: EnrollmentBasic[];
  className?: string;
}) {
  const activeEnrollments = enrollments ?? [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Enrolled Courses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeEnrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active enrollments yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="rounded-lg border border-border p-4 space-y-3 bg-muted/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium leading-tight">
                      {enrollment.course.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {enrollment.course.language} • {enrollment.course.level}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {enrollment.completedLessons} lessons
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <p className="text-xs text-muted-foreground">
                      {enrollment.progressPercent}%
                    </p>
                  </div>
                  <Progress value={enrollment.progressPercent} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
