export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center border border-gray-200">
        <h1 className="text-5xl font-bold text-purple-700 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Sorry, the page you are looking for does not exist or has been moved.<br />
          Please check the URL or return to the homepage.
        </p>
        <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Go to Homepage</a>
      </div>
    </div>
  );
} 