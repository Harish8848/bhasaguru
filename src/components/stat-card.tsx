import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtext?: string
  trend?: "up" | "down"
  trendValue?: string
  icon?: React.ReactNode
}

export function StatCard({ title, value, subtext, trend, trendValue, icon }: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">{title}</p>
            <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </div>
          {icon && <div className="text-primary">{icon}</div>}
        </div>

        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 mt-4 text-xs font-medium",
              trend === "up" ? "text-green-500" : "text-red-500",
            )}
          >
            {trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import { cn } from "@/lib/utils"
