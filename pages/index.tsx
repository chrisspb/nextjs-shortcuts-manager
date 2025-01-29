import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout.tsx';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Chargement...</div>;
  }

  if (!session) {
    return null;
  }

  if (session.user.role === 'ADMIN') {
    router.push('/admin');
    return null;
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section>
          <h2 className="text-2xl font-bold mb-4">Mes raccourcis</h2>
          {/* Liste des raccourcis */}
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Mes PDFs</h2>
          {/* Liste des PDFs */}
        </section>
      </div>
    </Layout>
  );
}