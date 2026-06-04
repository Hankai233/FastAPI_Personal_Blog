import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h2 className="text-4xl font-bold text-gray-900">404</h2>
      <p className="mt-4 text-gray-500">页面未找到</p>
      <Link href="/" className="mt-6 text-blue-600 hover:underline">
        返回首页
      </Link>
    </div>
  );
}
