import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Layout from '@/components/Layout';
import { useShortcuts } from '@/hooks/useShortcuts';
import { usePdfs } from '@/hooks/usePdfs';
import ShortcutCard from '@/components/ShortcutCard';
import PdfCard from '@/components/PdfCard';
import AddEditShortcutModal from '@/components/AddEditShortcutModal';
import AddEditPdfModal from '@/components/AddEditPdfModal';

interface Shortcut {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [managedUserEmail, setManagedUserEmail] = useState<string>('');
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedShortcut, setSelectedShortcut] = useState<Shortcut | null>(null);
  
  const userId = typeof window !== 'undefined' ? localStorage.getItem('selectedUserId') : null;
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'ADMIN') {
        router.push('/dashboard');
      } else if (!userId) {
        // Si pas d'utilisateur sélectionné, rediriger vers la page de sélection
        router.push('/admin/select-user');
      }
    }
  }, [status, session, router, userId]);

  const { shortcuts, loading: shortcutsLoading, addShortcut, updateShortcut, deleteShortcut } = useShortcuts(userId || undefined);
  const { pdfs, loading: pdfsLoading, addPdf, deletePdf } = usePdfs(userId || undefined);

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

    if (session?.user.role === 'ADMIN' && userId) {
      fetchUserInfo();
    }
  }, [userId, session]);

  const handleShortcutSubmit = async (data: Omit<Shortcut, 'id'>) => {
    try {
      if (selectedShortcut) {
        await updateShortcut(selectedShortcut.id, data);
        toast.success('Raccourci modifié avec succès');
      } else {
        await addShortcut(data);
        toast.success('Raccourci ajouté avec succès');
      }
      setIsShortcutModalOpen(false);
      setSelectedShortcut(null);
    } catch (error) {
      toast.error(selectedShortcut ? 'Erreur lors de la modification' : 'Erreur lors de l\'ajout');
    }
  };

  const handlePdfSubmit = async (formData: FormData) => {
    try {
      if (userId) {
        formData.append('userId', userId);
      }
      await addPdf(formData);
      toast.success('PDF ajouté avec succès');
      setIsPdfModalOpen(false);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du PDF');
    }
  };

  if (status === 'loading' || shortcutsLoading || pdfsLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="text-xl">Chargement...</div>
        </div>
      </Layout>
    );
  }

  if (!session || session.user.role !== 'ADMIN' || !userId) {
    return null;
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
                onClick={() => {
                  setSelectedShortcut(null);
                  setIsShortcutModalOpen(true);
                }}
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
                    onEdit={() => {
                      setSelectedShortcut(shortcut);
                      setIsShortcutModalOpen(true);
                    }}
                    onDelete={() => {
                      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce raccourci ?')) {
                        deleteShortcut(shortcut.id);
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
                onClick={() => setIsPdfModalOpen(true)}
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
                    onDelete={() => {
                      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce PDF ?')) {
                        deletePdf(pdf.id);
                      }
                    }}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        {isShortcutModalOpen && (
          <AddEditShortcutModal
            isOpen={isShortcutModalOpen}
            onClose={() => {
              setIsShortcutModalOpen(false);
              setSelectedShortcut(null);
            }}
            onSubmit={handleShortcutSubmit}
            initialData={selectedShortcut || undefined}
          />
        )}

        {isPdfModalOpen && (
          <AddEditPdfModal
            isOpen={isPdfModalOpen}
            onClose={() => setIsPdfModalOpen(false)}
            onSubmit={handlePdfSubmit}
          />
        )}
      </div>
    </Layout>
  );
}