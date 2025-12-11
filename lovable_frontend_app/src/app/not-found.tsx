import Link from "next/link";

/**
 * 404 page with navigation back to Projects.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">404 – Page Not Found</h2>
        <p className="text-gray-600 mb-4">
          The page you’re looking for doesn’t exist.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          Go to Projects
        </Link>
      </div>
    </div>
  );
}
