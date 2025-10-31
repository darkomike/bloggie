export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 flex items-center justify-center z-50">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative text-center">
        

        {/* Loading text with gradient */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3">
          Loading
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Please wait while we prepare your experience...
        </p>

        {/* Animated progress bar */}
        <div className="w-64 mx-auto mb-6">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Loading tips (optional) */}
        <div className="mt-12 px-6">
          <p className="text-sm text-gray-500 dark:text-gray-500 italic">
            &quot;Great content starts with great ideas&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
