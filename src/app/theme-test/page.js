export default function ThemeTest() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Theme Test Page
        </h1>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Color Test
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            If dark mode is working, you should see different colors when toggling the theme.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500 dark:bg-blue-700 p-4 rounded text-white">
            Blue Box (changes shade)
          </div>
          <div className="bg-green-500 dark:bg-green-700 p-4 rounded text-white">
            Green Box (changes shade)
          </div>
          <div className="bg-red-500 dark:bg-red-700 p-4 rounded text-white">
            Red Box (changes shade)
          </div>
          <div className="bg-purple-500 dark:bg-purple-700 p-4 rounded text-white">
            Purple Box (changes shade)
          </div>
        </div>

        <div className="border border-gray-300 dark:border-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Border Test
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            The border color should change with the theme.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-500">Gray 500 (same in both)</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gray 600/400 (changes)</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">Gray 700/300 (changes)</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">Gray 800/200 (changes)</p>
          <p className="text-sm text-gray-900 dark:text-gray-100">Gray 900/100 (changes)</p>
        </div>
      </div>
    </div>
  );
}
