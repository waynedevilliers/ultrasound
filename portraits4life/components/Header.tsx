'use client';

export default function Header() {
  const handleLanguageSwitch = () => {
    // Get current URL
    const currentPath = window.location.pathname;
    // Toggle between /en and /de
    let newPath;
    if (currentPath.startsWith('/en')) {
      newPath = currentPath.replace('/en', '/de');
    } else if (currentPath.startsWith('/de')) {
      newPath = currentPath.replace('/de', '/en');
    } else {
      newPath = '/de' + currentPath;
    }
    window.location.pathname = newPath;
  };

  const currentLang = typeof window !== 'undefined' && window.location.pathname.startsWith('/de') ? 'DE' : 'EN';
  const otherLang = currentLang === 'EN' ? 'DE' : 'EN';

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
            Portraits 4 Life
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-gray-600 hover:text-gray-900 transition">
              Home
            </a>
            <a href="/order" className="text-gray-600 hover:text-gray-900 transition">
              Order
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">
              Formats
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLanguageSwitch}
              className="px-3 py-1 rounded-full border border-gray-300 hover:border-pink-500 text-sm font-medium text-gray-700 hover:text-pink-600 transition"
            >
              {currentLang} / {otherLang}
            </button>

            <button className="md:hidden text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
