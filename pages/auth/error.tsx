import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ErrorPage() {
  const router = useRouter();
  const { error } = router.query;

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Email ou mot de passe incorrect.';
      case 'Callback':
        return 'Une erreur est survenue lors de la connexion.';
      case 'AccessDenied':
        return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
      default:
        return 'Une erreur est survenue.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Erreur d'authentification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error ? getErrorMessage(error as string) : 'Une erreur est survenue.'}
          </p>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/auth/signin"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Retourner à la page de connexion
          </Link>
        </div>
      </div>
    </div>
  );
}