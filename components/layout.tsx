import Link from 'next/link'

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto flex flex-col space-y-4">
      <header className="container sticky top-0 z-40 bg-white">
        <div className="h-16 border-b border-b-slate-200 py-4">
          <nav className="ml-4 pl-6">
            <Link href="#" className="px-4 py-2">
              Home
            </Link>
            <Link href="/qa" className="px-4 py-2">
              Q&A
            </Link>
            <Link href="/enhanced_code" className="px-4 py-2">
              Enhanced Code
            </Link>
            <Link href="/translate_code" className="px-4 py-2">
              Translate Code
            </Link>
          </nav>
        </div>
      </header>
      <div>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
