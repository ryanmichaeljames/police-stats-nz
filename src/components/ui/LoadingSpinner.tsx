export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
