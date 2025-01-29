import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (req.method === 'GET') {
    try {
      // Si c'est un admin et qu'il demande les PDFs d'un utilisateur spécifique
      if (session.user.role === 'ADMIN' && req.query.userId) {
        const pdfs = await prisma.pdf.findMany({
          where: {
            userId: req.query.userId as string
          }
        });
        return res.status(200).json(pdfs);
      }

      // Si c'est un utilisateur normal, il ne voit que ses PDFs
      const pdfs = await prisma.pdf.findMany({
        where: {
          userId: session.user.id
        }
      });
      return res.status(200).json(pdfs);
    } catch (error) {
      console.error('Erreur lors de la récupération des PDFs:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // ... reste du code pour POST, etc.
  return res.status(405).json({ error: 'Méthode non autorisée' });
}