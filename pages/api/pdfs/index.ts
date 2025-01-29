import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
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
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (req.method === 'GET') {
    try {
      const pdfs = await prisma.pdf.findMany({
        where: {
          OR: [
            { userId: session.user.id },
            { user: { managedBy: session.user.id } },
          ],
        },
      });
      return res.status(200).json(pdfs);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'POST') {
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    try {
      const form = formidable();
      const [fields, files] = await form.parse(req);
      const file = files.pdf?.[0];

      if (!file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const url = await saveFile(file);
      const title = fields.title?.[0] || file.originalFilename;
      const description = fields.description?.[0];
      const userId = fields.userId?.[0] || session.user.id;

      const pdf = await prisma.pdf.create({
        data: {
          title,
          url,
          description,
          userId,
        },
      });

      return res.status(201).json(pdf);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}