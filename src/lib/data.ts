import { BookOpen, Award, Briefcase, Users, TrendingUp, Globe } from "lucide-react"

  //Stats Data

  export const stats = [
   
   
    {
      number: "95%",
      label: "Satisfaction Rate",
      description: "Learners recommend BhasaGuru to others",
    },
    
  ]
  
//Footer Links Data
  export const footerLinks = [
    {
      title: "Product",
      links: ["Courses", "Jobs", "Pricing"],
    },
    {
      title: "Company",
      links: ["About", "Careers", "Contact"],
    },

    {
      title: "Legal",
      links: ["Privacy", "Terms",  "Licenses"],
    },
  ]

  //Language Levels Data
  export const languages = [
    { code: "japanese", label: "Japanese", courses: 12, icon: "🇯🇵", learners: 8500 },
    { code: "korean", label: "Korean", courses: 10, icon: "🇰🇷", learners: 6200 },
    { code: "english", label: "English", courses: 15, icon: "🇺🇸", learners: 12000 },
  ]
  
  export const levels = [
    { level: "BEGINNER", label: "A1", description: "Start your journey" },
    { level: "ELEMENTARY", label: "A2", description: "Build foundation" },
    { level: "INTERMEDIATE", label: "B1", description: "Speak with confidence" },
    { level: "UPPER_INTERMEDIATE", label: "B2", description: "Advanced fluency" },
    { level: "ADVANCED", label: "C1", description: "Near native level" },
    { level: "PROFICIENT", label: "C2", description: "Mastery achieved" },
  ]


  //Features Data
  export const features = [
    {
      icon: BookOpen,
      title: "Expert-Led Courses",
      description:
        "Comprehensive curriculum from CEFR A1 to C2 level. Learn at your own pace with video, audio, and interactive lessons.",
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
  

  //Job Stats Data
  export const jobStats = [
    { label: "Active Listings", value: "0", icon: Briefcase },
    { label: "Average Salary", value: "0", icon: TrendingUp },
    { label: "Successful Placements", value: "0", icon: Globe },
  ]

  //Culture Posts Data
  

  //Pricing Plans Data
  
  // Job Queries and Country Codes
  export const queries = {
    japan: "jobs in Japan",
    korea: "jobs in South Korea",
    uk: "jobs in United Kingdom",
    us: "jobs in United States",
    australia: "jobs in Australia",
  }

        export const countryCodes = {
          japan: "JP",
              korea: "KR",
              uk: "GB",
              us: "US",
              australia: "AU",
            }
