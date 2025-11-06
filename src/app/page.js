import HomePageContent from '@/components/HomePageContent';
import NewsletterForm from '@/components/NewsletterForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Main Content */}
      <HomePageContent />

      {/* Newsletter Section */}
      <section className="bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 py-12 sm:py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl font-bold">Stay Updated</h2>
            <p className="text-base sm:text-lg text-blue-100 px-4">Subscribe to our newsletter and never miss a new article</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
