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
    }
  }, [status, router]);

  if (status === 'loading' || shortcutsLoading || pdfsLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">Chargement...</div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Mes raccourcis</h2>
          {shortcuts.length === 0 ? (
            <p className="text-gray-600">Aucun raccourci disponible.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shortcuts.map((shortcut) => (
                <ShortcutCard
                  key={shortcut.id}
                  title={shortcut.title}
                  url={shortcut.url}
                  description={shortcut.description}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Mes PDFs</h2>
          {pdfs.length === 0 ? (
            <p className="text-gray-600">Aucun PDF disponible.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pdfs.map((pdf) => (
                <PdfCard
                  key={pdf.id}
                  title={pdf.title}
                  url={pdf.url}
                  description={pdf.description}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}