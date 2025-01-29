import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { useShortcuts } from '@/hooks/useShortcuts';
import { usePdfs } from '@/hooks/usePdfs';
import ShortcutCard from '@/components/ShortcutCard';
import PdfCard from '@/components/PdfCard';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { shortcuts, loading: shortcutsLoading } = useShortcuts();
  const { pdfs, loading: pdfsLoading } = usePdfs();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user.role === 'ADMIN') {
      // Si c'est un admin, rediriger vers la page de sélection d'utilisateur
      router.push('/admin/select-user');
    }
  }, [status, session, router]);

  if (status === 'loading' || shortcutsLoading || pdfsLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="text-xl">Chargement...</div>
        </div>
      </Layout>
    );
  }

  if (!session || session.user.role === 'ADMIN') {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Mes raccourcis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shortcuts.length === 0 ? (
                <p className="text-gray-500">Aucun raccourci disponible</p>
              ) : (
                shortcuts.map((shortcut) => (
                  <ShortcutCard
                    key={shortcut.id}
                    {...shortcut}
                    canEdit={false}
                  />
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Mes PDFs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pdfs.length === 0 ? (
                <p className="text-gray-500">Aucun PDF disponible</p>
              ) : (
                pdfs.map((pdf) => (
                  <PdfCard
                    key={pdf.id}
                    {...pdf}
                    canEdit={false}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}