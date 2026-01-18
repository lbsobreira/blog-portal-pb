"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SiteSettings {
  siteName: string;
  siteTagline: string;
  siteLogo: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.settings) {
          setSettings({
            siteName: data.settings.siteName || "IT Blog",
            siteTagline: data.settings.siteTagline || "A personal space to showcase IT projects and share technical knowledge",
            siteLogo: data.settings.siteLogo,
            githubUrl: data.settings.githubUrl,
            linkedinUrl: data.settings.linkedinUrl,
            twitterUrl: data.settings.twitterUrl,
          });
        } else {
          setSettings({
            siteName: "IT Blog",
            siteTagline: "A personal space to showcase IT projects and share technical knowledge",
            siteLogo: null,
            githubUrl: null,
            linkedinUrl: null,
            twitterUrl: null,
          });
        }
      })
      .catch(() => {
        setSettings({
          siteName: "IT Blog",
          siteTagline: "A personal space to showcase IT projects and share technical knowledge",
          siteLogo: null,
          githubUrl: null,
          linkedinUrl: null,
          twitterUrl: null,
        });
      });
  }, []);

  const navLinks = [
    { href: "/blog", label: "Blog" },
    { href: "/portfolio", label: "Projects" },
    { href: "/about", label: "About" },
  ];

  const socialLinks = settings ? [
    { url: settings.githubUrl, label: "GitHub" },
    { url: settings.linkedinUrl, label: "LinkedIn" },
    { url: settings.twitterUrl, label: "Twitter" },
  ].filter((link) => link.url) : [];

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left md:justify-items-center">
          {/* Brand */}
          <div className="md:text-center">
            <Link href="/" className="inline-flex items-center font-bold text-xl hover:text-blue-600 transition-colors">
              {!settings ? (
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : settings.siteLogo ? (
                <img
                  src={settings.siteLogo}
                  alt={settings.siteName}
                  className="h-12 w-auto object-contain dark:brightness-0 dark:invert"
                />
              ) : (
                <span>{settings.siteName}</span>
              )}
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] mx-auto">
              {settings?.siteTagline}
            </p>
          </div>

          {/* Navigation */}
          <div className="md:text-center">
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="md:text-center">
            <h3 className="font-semibold mb-4">Connect</h3>
            {socialLinks.length > 0 ? (
              <div className="flex space-x-4 justify-center">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                    aria-label={link.label}
                  >
                    <span className="text-sm">{link.label}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Links coming soon</p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            &copy; {currentYear} {settings?.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
