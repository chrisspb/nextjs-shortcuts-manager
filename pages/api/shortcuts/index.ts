import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (req.method === 'GET') {
    try {
      const shortcuts = await prisma.shortcut.findMany({
        where: {
          OR: [
            { userId: session.user.id },
            { user: { managedBy: session.user.id } },
          ],
        },
      });
      return res.status(200).json(shortcuts);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'POST') {
    if (session.user.role !== 'ADMIN') {
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
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}