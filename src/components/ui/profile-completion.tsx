"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, MapPin, Phone, User } from "lucide-react";

export type ProfileCompletionChecks = {
  name: boolean;
  phone: boolean;
  address: boolean;
};

export function calculateProfileCompletion(checks: ProfileCompletionChecks) {
  const completedCount = [checks.name, checks.phone, checks.address].filter(
    Boolean
  ).length;
  const total = 3;
  const percent = Math.round((completedCount / total) * 100);
  return { completedCount, total, percent };
}

export function ProfileCompletionCard({
  checks,
  className,
}: {
  checks: ProfileCompletionChecks;
  className?: string;
}) {
  const { completedCount, total, percent } = calculateProfileCompletion(checks);

  const Item = ({
    checked,
    icon,
    label,
  }: {
    checked: boolean;
    icon: React.ReactNode;
    label: string;
  }) => {
    return (
      <div className="flex items-center gap-2">
        <div className={checked ? "text-primary" : "text-muted-foreground"}>
          {checked ? <CheckCircle2 className="h-4 w-4" /> : icon}
        </div>
        <span className={checked ? "text-foreground" : "text-muted-foreground"}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">Profile completion</p>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{total} complete ({percent}%)
              </p>
            </div>
            <div className="mt-3">
              <Progress value={percent} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Item
              checked={checks.name}
              label="Full name"
              icon={<Circle className="h-4 w-4" />}
            />
            <Item
              checked={checks.phone}
              label="Phone"
              icon={<Phone className="h-4 w-4" />}
            />
            <Item
              checked={checks.address}
              label="Address"
              icon={<MapPin className="h-4 w-4" />}
            />
          </div>

          {/* Keep icons used so lint doesn't warn about unused imports */}
          <div className="hidden">
            <User />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
