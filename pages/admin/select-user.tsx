import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface User {
  id: string;
  email: string;
}

export default function SelectUser() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users/managed');
        if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user.role === 'ADMIN') {
      fetchUsers();
    }
  }, [session]);

  const handleUserSelect = (userId: string) => {
    // Stocker l'ID de l'utilisateur sélectionné dans la session ou localStorage
    localStorage.setItem('selectedUserId', userId);
    router.push('/admin/dashboard');
  };

  if (loading) {
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
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Sélectionner un utilisateur à administrer</h1>
        
        <div className="grid gap-4">
          <div 
            onClick={() => handleUserSelect(session?.user.id as string)}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-1">Mon Dashboard</h3>
            <p className="text-gray-600">{session?.user.email}</p>
          </div>

          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserSelect(user.id)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-1">Dashboard de {user.email}</h3>
              <p className="text-gray-600">Utilisateur géré</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
