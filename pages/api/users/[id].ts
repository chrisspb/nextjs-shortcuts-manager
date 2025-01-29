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
    return res.status(401).json({
      success: false,
      message: 'Non authentifié'
    });
  }

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé'
    });
  }

  const userId = req.query.id as string;

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          managedBy: true,
          createdAt: true,
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Vérifier que l'admin a le droit de voir cet utilisateur
      if (user.managedBy !== session.user.id && user.id !== session.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à voir cet utilisateur'
        });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}