import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-4xl text-white font-bold mb-8">Audacious Screens App</h1>
      <div className="space-y-4">
        <Link href="/show" className="block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          Go to Show Page
        </Link>
        <Link href="/admin" className="block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
          Go to Admin Page
        </Link>
      </div>
    </div>
  )
}
