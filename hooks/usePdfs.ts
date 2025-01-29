import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Pdf {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export const usePdfs = () => {
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPdfs = async () => {
    try {
      const response = await fetch('/api/pdfs');
      if (!response.ok) throw new Error('Erreur lors du chargement des PDFs');
      const data = await response.json();
      setPdfs(data);
    } catch (error) {
      toast.error('Impossible de charger les PDFs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addPdf = async (formData: FormData) => {
    try {
      const response = await fetch('/api/pdfs', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'ajout du PDF');
      
      const newPdf = await response.json();
      setPdfs([...pdfs, newPdf]);
      toast.success('PDF ajouté avec succès');
    } catch (error) {
      toast.error('Impossible d\'ajouter le PDF');
      console.error(error);
    }
  };

  const deletePdf = async (id: string) => {
    try {
      const response = await fetch(`/api/pdfs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression du PDF');
      
      setPdfs(pdfs.filter(p => p.id !== id));
      toast.success('PDF supprimé avec succès');
    } catch (error) {
      toast.error('Impossible de supprimer le PDF');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  return {
    pdfs,
    loading,
    addPdf,
    deletePdf,
    refreshPdfs: fetchPdfs,
  };
};