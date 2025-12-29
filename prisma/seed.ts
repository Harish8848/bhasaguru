import { PrismaClient, ArticleStatus } from "../src/generated/prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding culture articles (US, UK, AU, JP, KR)...")

  const cultureArticles = [
    // 🇺🇸 USA
    {
      slug: "culture-of-united-states",
      title: "Culture of the United States",
      excerpt: "An overview of American culture, traditions, and social values.",
      content: `
The culture of the United States is shaped by diversity, freedom, and innovation.
People from different ethnic backgrounds contribute to American traditions,
food, music, and lifestyle.

Major cultural elements include individualism, freedom of speech,
popular entertainment such as Hollywood, and sports like baseball,
basketball, and American football.
      `,
      language: "en",
      category: "culture",
      tags: ["usa", "american culture", "traditions", "lifestyle"],
      featuredImage: "/images/culture/usa-culture.jpg",
      status: ArticleStatus.PUBLISHED,
      readTime: 5,
      metaTitle: "Culture of the United States",
      metaDescription: "Explore American culture, traditions, lifestyle, and social values.",
      authorName: "Editorial Team",
      publishedAt: new Date(),
    },

    // 🇬🇧 UK
    {
      slug: "culture-of-united-kingdom",
      title: "Culture of the United Kingdom",
      excerpt: "British culture influenced by history, monarchy, and traditions.",
      content: `
The United Kingdom has a rich cultural heritage influenced by centuries
of history, monarchy, and literature.

Tea culture, politeness, respect for traditions, and sports like football
and cricket are deeply rooted in British society.
      `,
      language: "en",
      category: "culture",
      tags: ["uk", "british culture", "traditions", "heritage"],
      featuredImage: "/images/culture/uk-culture.jpg",
      status: ArticleStatus.PUBLISHED,
      readTime: 4,
      metaTitle: "Culture of the United Kingdom",
      metaDescription: "Discover British culture, traditions, and historical influence.",
      authorName: "Editorial Team",
      publishedAt: new Date(),
    },

    // 🇦🇺 Australia
    {
      slug: "culture-of-australia",
      title: "Culture of Australia",
      excerpt: "A blend of Indigenous heritage and modern multicultural society.",
      content: `
Australian culture is a mix of Indigenous traditions and modern multicultural
influences. Aboriginal culture is one of the world’s oldest living cultures.

Australians value equality, friendliness, outdoor lifestyles,
and sports like cricket and rugby.
      `,
      language: "en",
      category: "culture",
      tags: ["australia", "culture", "indigenous", "lifestyle"],
      featuredImage: "/images/culture/australia-culture.jpg",
      status: ArticleStatus.PUBLISHED,
      readTime: 4,
      metaTitle: "Culture of Australia",
      metaDescription: "Learn about Australian culture, Indigenous heritage, and lifestyle.",
      authorName: "Editorial Team",
      publishedAt: new Date(),
    },

    // 🇯🇵 Japan
    {
      slug: "culture-of-japan",
      title: "Culture of Japan",
      excerpt: "A balance of tradition, respect, and modern innovation.",
      content: `
Japanese culture emphasizes respect, discipline, and harmony.
Traditional practices such as tea ceremonies, kimono, and festivals
coexist with modern technology and pop culture.

Values like punctuality, politeness, and teamwork are central
to Japanese society.
      `,
      language: "en",
      category: "culture",
      tags: ["japan", "japanese culture", "tradition", "modern"],
      featuredImage: "/images/culture/japan-culture.jpg",
      status: ArticleStatus.PUBLISHED,
      readTime: 5,
      metaTitle: "Culture of Japan",
      metaDescription: "Understand Japanese culture, traditions, and social values.",
      authorName: "Editorial Team",
      publishedAt: new Date(),
    },

    // 🇰🇷 Korea
    {
      slug: "culture-of-korea",
      title: "Culture of Korea",
      excerpt: "Korean culture shaped by history, Confucian values, and modern trends.",
      content: `
Korean culture is influenced by Confucian values such as respect for elders,
family bonds, and education.

Traditional customs coexist with global phenomena like K-pop, K-dramas,
and Korean cuisine, making Korea culturally influential worldwide.
      `,
      language: "en",
      category: "culture",
      tags: ["korea", "korean culture", "tradition", "k-pop"],
      featuredImage: "/images/culture/korea-culture.jpg",
      status: ArticleStatus.PUBLISHED,
      readTime: 4,
      metaTitle: "Culture of Korea",
      metaDescription: "Explore Korean culture, traditions, and modern global influence.",
      authorName: "Editorial Team",
      publishedAt: new Date(),
    },
  ]

  for (const article of cultureArticles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    })
  }

  console.log("✅ Culture articles seeded successfully!")
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })