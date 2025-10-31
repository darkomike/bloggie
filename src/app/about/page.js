import Link from 'next/link';

export const metadata = {
  title: 'About Us - Bloggie',
  description: 'Learn more about Bloggie and our mission',
};

export default function AboutPage() {
  const team = [
    { name: 'Sarah Johnson', role: 'Founder & CEO', avatar: 'SJ' },
    { name: 'Michael Chen', role: 'Head of Content', avatar: 'MC' },
    { name: 'Emily Rodriguez', role: 'Lead Developer', avatar: 'ER' },
    { name: 'David Kim', role: 'Design Director', avatar: 'DK' },
  ];

  const stats = [
    { label: 'Articles Published', value: '500+' },
    { label: 'Active Readers', value: '50K+' },
    { label: 'Expert Authors', value: '25+' },
    { label: 'Years of Experience', value: '5+' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-900 dark:to-purple-900 py-16 sm:py-20 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6">
              About Bloggie
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto px-4">
              We&apos;re on a mission to share knowledge, inspire creativity, and build a community of curious minds.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="grid gap-12 md:gap-16 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Our Mission
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
              At Bloggie, we believe in the power of shared knowledge. Our platform brings together expert writers, passionate creators, and curious readers to explore ideas that matter.
            </p>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
              Whether you&apos;re looking to learn something new, stay updated with industry trends, or simply find inspiration, we&apos;re here to provide high-quality content that enriches your journey.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore Our Blog
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700"></div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
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

      {/* Team Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Meet Our Team
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Passionate individuals dedicated to bringing you the best content
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div key={member.name} className="text-center group">
              <div className="relative mb-4 sm:mb-6 inline-block">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold group-hover:scale-110 transition-transform">
                  {member.avatar}
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                {member.name}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Our Values
            </h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 sm:mb-6">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                Quality First
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Every article is carefully researched, written, and reviewed to ensure accuracy and value.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 sm:mb-6">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                Community Driven
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                We listen to our readers and create content that addresses real needs and interests.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 sm:mb-6">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                Innovation
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                We embrace new ideas and technologies to improve the reading and writing experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-900 px-6 py-12 sm:px-12 sm:py-16 md:px-16 md:py-20 text-center">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Join Our Community
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Subscribe to our newsletter and never miss an update
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
