import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-6xl font-bold text-gray-900">
          Bevy
        </h1>
        <p className="text-xl text-gray-600 max-w-md">
          University club payment and admin management made simple
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/signup">
            <Button size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}