import { BookOpen, Briefcase, Award, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

const features = [
  {
    icon: BookOpen,
    title: "Expert-Led Courses",
    description:
      "Comprehensive curriculum from CEFR A1 to C2 level. Learn at your own pace with video, audio, and interactive lessons.",
  },
  {
    icon: Award,
    title: "Certifications",
    description:
      "Earn recognized language proficiency certificates. Boost your resume and demonstrate your skills to employers.",
  },
  {
    icon: Briefcase,
    title: "Job Opportunities",
    description:
      "Browse 1000+ international job listings. Get matched with positions that fit your language skills and career goals.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Connect with learners worldwide. Share experiences, get feedback, and build professional networks globally.",
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Why Choose <span className="text-accent">BhasaGuru?</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need to master languages and advance your international career
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow border-border">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
