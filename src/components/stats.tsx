"use client"

const stats = [
  {
    number: "50K+",
    label: "Active Learners",
    description: "From 85+ countries learning with BhasaGuru",
  },
  {
    number: "500+",
    label: "Expert Courses",
    description: "From beginner to advanced proficiency levels",
  },
  {
    number: "95%",
    label: "Satisfaction Rate",
    description: "Learners recommend BhasaGuru to others",
  },
  {
    number: "1000+",
    label: "Job Placements",
    description: "Successful placements in 2024 alone",
  },
]

export default function StatsSection() {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center space-y-3 p-6 rounded-lg border border-border hover:border-accent/50 transition-colors"
            >
              <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.number}
              </div>
              <h3 className="text-lg font-semibold">{stat.label}</h3>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
