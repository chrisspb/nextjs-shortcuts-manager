import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

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

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Méthode non autorisée' 
    });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email et mot de passe requis' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER',
        managedBy: session.user.id,
      },
    });

    // Ne pas renvoyer le mot de passe hashé
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({ 
      success: true,
      message: 'Utilisateur créé avec succès',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur' 
    });
  }
}