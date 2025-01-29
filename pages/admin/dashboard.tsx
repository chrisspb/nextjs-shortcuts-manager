import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useShortcuts } from '@/hooks/useShortcuts';
import { usePdfs } from '@/hooks/usePdfs';
import ShortcutCard from '@/components/ShortcutCard';
import PdfCard from '@/components/PdfCard';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [managedUserEmail, setManagedUserEmail] = useState<string>('');
  
  // Récupérer l'ID de l'utilisateur géré depuis le localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem('selectedUserId') : null;
  
  const { shortcuts, loading: shortcutsLoading, addShortcut, updateShortcut, deleteShortcut } = useShortcuts(userId || undefined);
  const { pdfs, loading: pdfsLoading, addPdf, deletePdf } = usePdfs(userId || undefined);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Récupérer les informations de l'utilisateur géré
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/users/${userId}`);
          if (response.ok) {
            const data = await response.json();
            setManagedUserEmail(data.email);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des informations utilisateur:', error);
        }
      }
    };

    fetchUserInfo();
  }, [userId]);

  if (status === 'loading' || shortcutsLoading || pdfsLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="text-xl">Chargement...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            {managedUserEmail 
              ? `Administration du tableau de bord de ${managedUserEmail}`
              : 'Administration du tableau de bord'}
          </h1>
          <button 
            onClick={() => router.push('/admin/select-user')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Changer d'utilisateur
          </button>
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Raccourcis</h2>
              <button 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={() => {/* TODO: Ouvrir modale d'ajout de raccourci */}}
              >
                Ajouter un raccourci
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shortcuts.length === 0 ? (
                <p className="text-gray-500">Aucun raccourci disponible</p>
              ) : (
                shortcuts.map((shortcut) => (
                  <ShortcutCard
                    key={shortcut.id}
                    {...shortcut}
                    canEdit
                    onEdit={() => {/* TODO: Ouvrir modale d'édition */}}
                    onDelete={async () => {
                      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce raccourci ?')) {
                        await deleteShortcut(shortcut.id);
                      }
                    }}
                  />
                ))
              )}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">PDFs</h2>
              <button 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={() => {/* TODO: Ouvrir modale d'ajout de PDF */}}
              >
                Ajouter un PDF
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pdfs.length === 0 ? (
                <p className="text-gray-500">Aucun PDF disponible</p>
              ) : (
                pdfs.map((pdf) => (
                  <PdfCard
                    key={pdf.id}
                    {...pdf}
                    canEdit
                    onDelete={async () => {
                      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce PDF ?')) {
                        await deletePdf(pdf.id);
                      }
                    }}
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