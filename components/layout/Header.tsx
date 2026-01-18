"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";

interface SiteBranding {
  siteName: string;
  siteLogo: string | null;
  siteLogoZoom: number;
  siteLogoX: number;
  siteLogoY: number;
}

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [branding, setBranding] = useState<SiteBranding | null>(null);

  useEffect(() => {
    // Fetch site branding (no-store to get fresh data after settings change)
    fetch("/api/settings/branding", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          setBranding({
            siteName: data.siteName || "IT Blog",
            siteLogo: data.siteLogo,
            siteLogoZoom: data.siteLogoZoom || 100,
            siteLogoX: data.siteLogoX || 0,
            siteLogoY: data.siteLogoY || 0,
          });
        } else {
          setBranding({ siteName: "IT Blog", siteLogo: null, siteLogoZoom: 100, siteLogoX: 0, siteLogoY: 0 });
        }
      })
      .catch(() => {
        setBranding({ siteName: "IT Blog", siteLogo: null, siteLogoZoom: 100, siteLogoX: 0, siteLogoY: 0 });
      });
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/portfolio", label: "Projects" },
    { href: "/about", label: "About" },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center font-bold text-xl hover:text-blue-600 transition-colors">
            {!branding ? (
              <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : branding.siteLogo ? (
              <div className="h-20 flex items-center">
                <img
                  src={branding.siteLogo}
                  alt={branding.siteName}
                  className="h-full w-auto object-contain dark:brightness-0 dark:invert"
                  style={{
                    transform: `scale(${branding.siteLogoZoom / 100}) translate(${branding.siteLogoX / (branding.siteLogoZoom / 100)}px, ${branding.siteLogoY / (branding.siteLogoZoom / 100)}px)`,
                    transformOrigin: 'center center',
                  }}
                  onError={(e) => {
                    // If logo fails to load, hide container and show site name
                    const container = e.currentTarget.parentElement as HTMLElement;
                    if (container) container.style.display = 'none';
                    const sibling = container?.nextElementSibling as HTMLElement;
                    if (sibling) sibling.style.display = 'inline';
                  }}
                />
              </div>
            ) : (
              <span>{branding.siteName}</span>
            )}
            {branding?.siteLogo && <span style={{ display: 'none' }}>{branding.siteName}</span>}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(link.href)
                    ? "text-blue-600"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {status === "loading" ? (
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {session.user.name || session.user.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Navigation Links */}
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Theme Toggle - Mobile */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === "dark" ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Switch to Dark Mode
                </>
              )}
            </button>

            {/* Auth Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              {status === "loading" ? (
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ) : session ? (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-4 py-2">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {(session.user.name || session.user.email || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Admin Link */}
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      signOut();
                    }}
                    className="w-full px-4 py-3 text-left rounded-lg text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={closeMobileMenu}
                  className="block w-full px-4 py-3 text-center text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
