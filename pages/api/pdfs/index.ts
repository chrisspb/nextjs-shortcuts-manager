import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

const saveFile = async (file: formidable.File): Promise<string> => {
  const data = await fs.readFile(file.filepath);
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  
  const filename = `${Date.now()}-${file.originalFilename}`;
  const filePath = path.join(uploadDir, filename);
  
  await fs.writeFile(filePath, data);
  await fs.unlink(file.filepath);
  
  return `/uploads/${filename}`;
};

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

  if (req.method === 'POST') {
    try {
      const form = formidable();
      const [fields, files] = await form.parse(req);
      
      const pdfFile = files.pdf?.[0];
      if (!pdfFile) {
        return res.status(400).json({ error: 'Aucun fichier PDF fourni' });
      }

      // Vérifier le type MIME
      if (!pdfFile.mimetype?.includes('pdf')) {
        return res.status(400).json({ error: 'Le fichier doit être un PDF' });
      }

      const url = await saveFile(pdfFile);
      const title = fields.title?.[0] || pdfFile.originalFilename;
      const description = fields.description?.[0];
      
      // Utiliser l'ID de l'utilisateur cible (pour les admins) ou l'ID de l'utilisateur connecté
      const targetUserId = req.query.userId as string || session.user.id;

      // Vérifier les permissions
      if (session.user.role !== 'ADMIN' && targetUserId !== session.user.id) {
        return res.status(403).json({ error: 'Non autorisé' });
      }

      const pdf = await prisma.pdf.create({
        data: {
          title: title || 'Sans titre',
          url,
          description,
          userId: targetUserId,
        },
      });

      return res.status(201).json(pdf);
    } catch (error) {
      console.error('Erreur lors de l\'upload du PDF:', error);
      return res.status(500).json({ error: 'Erreur lors de l\'upload du PDF' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}