import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import ShortcutCard from '../../components/ShortcutCard';
import PdfCard from '../../components/PdfCard';
import { useShortcuts } from '../../hooks/useShortcuts';
import { usePdfs } from '../../hooks/usePdfs';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { shortcuts, loading: shortcutsLoading, addShortcut, updateShortcut, deleteShortcut } = useShortcuts();
  const { pdfs, loading: pdfsLoading, addPdf, deletePdf } = usePdfs();
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [selectedShortcut, setSelectedShortcut] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600">Accès non autorisé</h2>
          <p className="mt-2 text-gray-600">Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </Layout>
    );
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', file.name);

    try {
      await addPdf(formData);
      toast.success('PDF uploadé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'upload du PDF');
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Gestion des raccourcis</h2>
            <button
              onClick={() => setIsShortcutModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Ajouter un raccourci
            </button>
          </div>

          {shortcutsLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shortcuts.map((shortcut) => (
                <ShortcutCard
                  key={shortcut.id}
                  {...shortcut}
                  canEdit
                  onEdit={() => {
                    setSelectedShortcut(shortcut);
                    setIsShortcutModalOpen(true);
                  }}
                  onDelete={() => deleteShortcut(shortcut.id)}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Gestion des PDFs</h2>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Ajouter un PDF
              </label>
            </div>
          </div>

          {pdfsLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pdfs.map((pdf) => (
                <PdfCard
                  key={pdf.id}
                  {...pdf}
                  canEdit
                  onDelete={() => deletePdf(pdf.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}