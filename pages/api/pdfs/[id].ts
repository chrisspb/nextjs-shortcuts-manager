import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const pdfId = req.query.id as string;

  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Non authentifié'
    });
  }

  // Vérifier que l'utilisateur a le droit d'accéder à ce PDF
  const pdf = await prisma.pdf.findUnique({
    where: { id: pdfId },
  });

  if (!pdf) {
    return res.status(404).json({
      success: false,
      message: 'PDF non trouvé'
    });
  }

  // Vérifier les permissions
  if (pdf.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé'
    });
  }

  if (req.method === 'DELETE') {
    try {
      // Supprimer le fichier physique
      const filePath = path.join(process.cwd(), 'public', pdf.url);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error);
        // On continue même si le fichier n'existe pas physiquement
      }

      // Supprimer l'entrée dans la base de données
      await prisma.pdf.delete({
        where: { id: pdfId },
      });

      return res.status(200).json({
        success: true,
        message: 'PDF supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du PDF:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du PDF'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
}