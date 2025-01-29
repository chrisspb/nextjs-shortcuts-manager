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

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        where: {
          managedBy: session.user.id,
          role: 'USER',
        },
        select: {
          id: true,
          email: true,
        },
      });
      
      return res.status(200).json(users);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}