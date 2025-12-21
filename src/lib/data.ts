import { BookOpen, Award, Briefcase, Users, TrendingUp, Globe } from "lucide-react"

//FAQs Data
export const faqs = [
    {
      id: 1,
      question: "What languages can I learn on BhasaGuru?",
      answer:
        "We offer Japanese, Korean, and English (IELTS,PTE) courses with CEFR levels from A1 to C2. Each language has comprehensive curriculum with video lessons, interactive exercises, and real-world scenarios.",
    },
    {
      id: 2,
      question: "How long does it take to become job-ready?",
      answer:
        "Most learners reach job-ready proficiency (B1-B2) in 4-6 months with consistent study. However, it depends on your starting level and commitment. We have a structured learning path to help you.",
    },
    {
      id: 3,
      question: "Are the certifications recognized internationally?",
      answer:
        "Yes! Our certifications align with CEFR standards and are recognized by employers in Japan, Korea, and globally. Many of our graduates have successfully used them for visa applications and job applications.",
    },
    {
      id: 4,
      question: "Can I access courses on mobile?",
      answer:
        "Obiviously, our web app is fully mobile responsive so,  You can download lessons and study offline, making it perfect for busy professionals.",
    },
    {
      id: 5,
      question: "What if I'm a complete beginner?",
      answer:
        "Perfect! We have dedicated A1 courses for complete beginners. Our step-by-step approach ensures you build strong foundations. Join thousands of beginners who have successfully progressed.",
    },
    {
      id: 6,
      question: "Is there job guarantee after course completion?",
      answer:
        "While we can't guarantee jobs, we actively match learners with opportunities and have a 95% placement success rate within 6 months of completion. Our job board has 1000+ listings.",
    },
  ]




  //Stats Data

  export const stats = [
    {
      number: "2",
      label: "Active Learners",
      description: "From 85+ countries learning with BhasaGuru",
    },
    {
      number: "10+",
      label: "Expert Courses",
      description: "From beginner to advanced proficiency levels",
    },
    {
      number: "95%",
      label: "Satisfaction Rate",
      description: "Learners recommend BhasaGuru to others",
    },
    {
      number: "0",
      label: "Job Placements",
      description: "Successful placements in 2024 alone",
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
  

  //Job Stats Data
  export const jobStats = [
    { label: "Active Listings", value: "0", icon: Briefcase },
    { label: "Average Salary", value: "0", icon: TrendingUp },
    { label: "Successful Placements", value: "0", icon: Globe },
  ]

  //Culture Posts Data
  export const culturePosts = [
    {
      id: 1,
      title: "The Art of Japanese Tea Ceremony",
      excerpt: "Explore the rich history and traditions of the Japanese tea ceremony, a spiritual and aesthetic ritual.",
      author: "Yuki Tanaka",
      date: "Nov 28, 2024",
      category: "Tradition",
      image: "/japanese-tea-ceremony.jpg",
      country: "japan",
    },
    {
      id: 2,
      title: "K-Pop: A Global Phenomenon",
      excerpt: "Discover the rise of Korean Pop music and its impact on global culture, fashion, and entertainment.",
      author: "Min-jun Kim",
      date: "Nov 25, 2024",
      category: "Modern Culture",
      image: "/k-pop-phenomenon.jpg",
      country: "korea",
    },
    {
      id: 3,
      title: "A Guide to British Pub Culture",
      excerpt: "Learn about the social etiquette and traditions of British pubs, an integral part of UK social life.",
      author: "Emily Clark",
      date: "Nov 22, 2024",
      category: "Social Life",
      image: "/british-pub-culture.jpg",
      country: "uk",
    },
    {
      id: 4,
      title: "American Dream: From Immigration to Innovation",
      excerpt: "Explore the cultural narrative of the American Dream and its impact on global immigration and entrepreneurship.",
      author: "Sarah Johnson",
      date: "Nov 20, 2024",
      category: "Modern Culture",
      image: "/american-dream.jpg",
      country: "us",
    },
    {
      id: 5,
      title: "Australian Outback Adventures",
      excerpt: "Discover the unique traditions and lifestyle of Australia's outback culture, from Aboriginal heritage to modern bush life.",
      author: "David Mitchell",
      date: "Nov 18, 2024",
      category: "Adventure",
      image: "/australian-outback.jpg",
      country: "australia",
    },
  ]

  //Pricing Plans Data
  export const plans = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfect for beginners",
      price: "Free",
      period: "forever",
      features: [
        "A1 & A2 level courses",
        "Basic lessons only",
        "Community access",
        "Limited job listings",
        "Certificate of completion",
        "Mobile app access",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      id: "pro",
      name: "Pro",
      description: "Most popular for learners",
      price: "$29",
      period: "/month",
      features: [
        "All A & B level courses",
        "Live classes & workshops",
        "1-on-1 mentoring",
        "Premium job listings",
        "Official CEFR certificate",
        "Mobile app + offline",
        "Job matching service",
        "Career consulting",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For organizations & teams",
      price: "Custom",
      period: "pricing",
      features: [
        "All courses & features",
        "Unlimited team members",
        "Team analytics",
        "Dedicated support",
        "Custom curriculum",
        "API access",
        "White-label options",
        "Priority job matching",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ]

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
