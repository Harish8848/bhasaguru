import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Enrollments Management</h1>
        <p className="text-muted-foreground mt-1">Loading...</p>
      </div>
      <div className="h-8 w-48 bg-muted/30 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card border-border p-4">
            <div className="h-16 animate-pulse bg-muted/30 rounded" />
          </Card>
        ))}
      </div>
      <Card className="bg-card border-border p-4">
        <div className="h-64 animate-pulse bg-muted/30 rounded" />
      </Card>
    </div>
  )
}
