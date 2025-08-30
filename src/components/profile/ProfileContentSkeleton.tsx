export function ProfileContentSkeleton() {
  return (
    <>
      <div id="goals-header" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-6">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </>
  );
}
