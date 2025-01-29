import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Shortcut {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export const useShortcuts = (userId?: string) => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShortcuts = async () => {
    try {
      // Si un userId est fourni, on l'ajoute comme query parameter
      const url = userId 
        ? `/api/shortcuts?userId=${userId}`
        : '/api/shortcuts';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du chargement des raccourcis");
      const data = await response.json();
      setShortcuts(data);
    } catch (error) {
      toast.error("Impossible de charger les raccourcis");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addShortcut = async (shortcutData: Omit<Shortcut, 'id'>) => {
    try {
      const response = await fetch('/api/shortcuts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shortcutData,
          userId: userId, // On ajoute l'userId si fourni
        }),
      });
      
      if (!response.ok) throw new Error("Erreur lors de l'ajout du raccourci");
      
      const newShortcut = await response.json();
      setShortcuts([...shortcuts, newShortcut]);
      toast.success("Raccourci ajouté avec succès");
    } catch (error) {
      toast.error("Impossible d'ajouter le raccourci");
      console.error(error);
    }
  };

  const updateShortcut = async (id: string, shortcutData: Partial<Shortcut>) => {
    try {
      const response = await fetch(`/api/shortcuts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shortcutData),
      });
      
      if (!response.ok) throw new Error("Erreur lors de la modification du raccourci");
      
      const updatedShortcut = await response.json();
      setShortcuts(shortcuts.map(s => s.id === id ? updatedShortcut : s));
      toast.success("Raccourci modifié avec succès");
    } catch (error) {
      toast.error("Impossible de modifier le raccourci");
      console.error(error);
    }
  };

  const deleteShortcut = async (id: string) => {
    try {
      const response = await fetch(`/api/shortcuts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error("Erreur lors de la suppression du raccourci");
      
      setShortcuts(shortcuts.filter(s => s.id !== id));
      toast.success("Raccourci supprimé avec succès");
    } catch (error) {
      toast.error("Impossible de supprimer le raccourci");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchShortcuts();
  }, [userId]); // Refetch when userId changes

  return {
    shortcuts,
    loading,
    addShortcut,
    updateShortcut,
    deleteShortcut,
    refreshShortcuts: fetchShortcuts,
  };
};