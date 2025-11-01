import Link from 'next/link';
import Image from 'next/image';
import { blogService } from '@/lib/firebase/blog-service';
import { viewService } from '@/lib/firebase/view-service';
import CTASection from '@/components/CTASection';

export const metadata = {
  title: 'About Us - Bloggie',
  description: 'Learn more about Bloggie and our mission to share knowledge and inspire creativity',
};

const team = [
  { name: 'Michael Ofosu Darko', role: 'Founder & CEO', avatar: 'MD', bio: 'Passionate about content and community building' },
  { name: 'Michael Chen', role: 'Head of Content', avatar: 'MC', bio: 'Expert in editorial excellence' },
  { name: 'Emily Rodriguez', role: 'Lead Developer', avatar: 'ER', bio: 'Full-stack engineering enthusiast' },
  { name: 'David Kim', role: 'Design Director', avatar: 'DK', bio: 'Creative director with 10+ years experience' },
];

async function getStats() {
  try {
    // Get all posts
    const posts = await blogService.getAllPosts();
    const totalPosts = posts.length;

    // Get unique authors
    const authorsSet = new Set(posts.map(post => post.author?.uid).filter(Boolean));
    const totalAuthors = authorsSet.size;

    // Get unique categories
    const categoriesSet = new Set(posts.map(post => post.category).filter(Boolean));
    const totalCategories = categoriesSet.size;

    // Get total views from view service
    let totalViews = 0;
    try {
      const allViews = await viewService.getAllViews();
      totalViews = Array.isArray(allViews) ? allViews.length : 0;
    } catch (e) {
      // Silent fail - use default stats
    }

  // Format active readers (convert totalViews to thousands => K, minimum 5K)
  // Divide by 1000 because we want to display the number in 'K'
  const activeReaders = totalViews > 0 ? Math.max(Math.floor(totalViews / 1000), 5) : 50;

    return [
      { label: 'Articles Published', value: totalPosts.toString() },
      { label: 'Active Readers', value: `${activeReaders}K+` },
      { label: 'Expert Authors', value: totalAuthors.toString() },
      { label: 'Categories', value: totalCategories.toString() },
    ];
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return default stats if there's an error
    return [
      { label: 'Articles Published', value: '500+' },
      { label: 'Active Readers', value: '50K+' },
      { label: 'Expert Authors', value: '25+' },
      { label: 'Categories', value: '10+' },
    ];
  }
}

function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-900 dark:to-purple-900 py-16 sm:py-20 md:py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2"></div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-sm font-semibold text-blue-600 dark:text-blue-300">
            ✨ Trusted by thousands of readers
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6">
            About Bloggie
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto px-4">
            We&apos;re on a mission to share knowledge, inspire creativity, and build a vibrant community of curious minds who seek to grow and learn.
          </p>
        </div>
      </div>
    </div>
  );
}

function MissionSection() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
      <div className="grid gap-12 md:gap-16 md:grid-cols-2 items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Our Mission
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
            At Bloggie, we believe in the transformative power of shared knowledge. Our platform brings together expert writers, passionate creators, and curious readers to explore ideas that genuinely matter and create meaningful conversations.
          </p>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
            Whether you&apos;re looking to learn something new, stay ahead with industry trends, or simply find inspiration, we&apos;re committed to providing thoughtfully crafted content that enriches your perspective and accelerates your growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore Our Blog
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Browse Categories
            </Link>
          </div>
        </div>
        <div className="relative">
          <Image
            src="/assets/images/about-2.jpg"
            alt="Our mission at Bloggie"
            width={500}
            height={500}
            className="w-full rounded-2xl shadow-2xl object-cover"
          />
        </div>
      </div>
    </div>
  );
}

function StatsSection({ stats }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamSection() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
      <div className="text-center mb-8 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Meet Our Team
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
          Passionate individuals dedicated to bringing you the best content and experience
        </p>
      </div>

      <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
        {team.map((member) => (
          <div key={member.name} className="group">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-linear-to-br from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {member.avatar}
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                {member.name}
              </h3>
              <p className="text-sm sm:text-base text-blue-600 dark:text-blue-400 font-semibold mb-2">
                {member.role}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {member.bio}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValuesSection() {
  const values = [
    {
      icon: '✓',
      color: 'blue',
      title: 'Quality First',
      description: 'Every article is meticulously researched, expertly written, and rigorously reviewed to ensure accuracy, depth, and lasting value.'
    },
    {
      icon: '👥',
      color: 'purple',
      title: 'Community Driven',
      description: 'We actively listen to our readers and create content that directly addresses real needs, interests, and challenges.'
    },
    {
      icon: '⚡',
      color: 'green',
      title: 'Innovation',
      description: 'We continuously embrace new ideas and cutting-edge technologies to enhance the reading and writing experience.'
    },
    {
      icon: '🎯',
      color: 'orange',
      title: 'Impact',
      description: 'We measure success by the tangible positive impact our content has on readers\' growth and success.'
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Our Core Values
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const colorMap = {
              blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
              purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
              green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
              orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
            };

            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg ${colorMap[value.color]} flex items-center justify-center mb-4 sm:mb-6 text-2xl font-bold`}>
                  {value.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {value.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default async function AboutPage() {
  const stats = await getStats();
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HeroSection />
      <MissionSection />
      <StatsSection stats={stats} />
      <TeamSection />
      <ValuesSection />
      <CTASection />
    </div>
  );
}
