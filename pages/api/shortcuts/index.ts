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
      // Si c'est un admin et qu'il demande les raccourcis d'un utilisateur spécifique
      if (session.user.role === 'ADMIN' && req.query.userId) {
        const shortcuts = await prisma.shortcut.findMany({
          where: {
            userId: req.query.userId as string
          }
        });
        return res.status(200).json(shortcuts);
      }

      // Si c'est un utilisateur normal, il ne voit que ses raccourcis
      const shortcuts = await prisma.shortcut.findMany({
        where: {
          userId: session.user.id
        }
      });
      return res.status(200).json(shortcuts);
    } catch (error) {
      console.error('Erreur lors de la récupération des raccourcis:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'POST') {
    if (session.user.role !== 'ADMIN' && req.body.userId !== session.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const { title, url, description, userId } = req.body;

    try {
      const shortcut = await prisma.shortcut.create({
        data: {
          title,
          url,
          description,
          userId: userId || session.user.id,
        },
      });
      return res.status(201).json(shortcut);
    } catch (error) {
      console.error('Erreur lors de la création du raccourci:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}