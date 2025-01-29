import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session.user.role === 'ADMIN') {
        const selectedUserId = localStorage.getItem('selectedUserId');
        // Si un utilisateur est déjà sélectionné, aller au dashboard admin
        if (selectedUserId) {
          router.push('/admin/dashboard');
        } else {
          // Sinon, aller à la page de sélection d'utilisateur
          router.push('/admin/select-user');
        }
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return null;
}