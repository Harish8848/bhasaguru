export default function LessonsLoading() {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted/50 rounded-lg w-48 animate-pulse" />
        <div className="h-10 bg-muted/50 rounded-lg w-64 animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  