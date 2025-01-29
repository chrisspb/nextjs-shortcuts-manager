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
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, router, session]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return null;
}