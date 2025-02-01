'use client'

import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from '../i18n/client';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Home link */}
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-800">Shortcuts Manager</span>
            </div>

            {/* Navigation links */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {session && (
                  <>
                    <span className="text-gray-600">
                      {session.user?.email}
                    </span>
                    <button
                      onClick={() => signOut()}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      {t('common.logout')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Shortcuts Manager. {t('common.allRightsReserved')}
          </div>
        </div>
      </footer>
    </div>
  );
}