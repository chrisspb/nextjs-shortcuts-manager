import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, isAdmin } = await request.json();

    // Vérifier si un administrateur existe déjà
    if (isAdmin) {
      const existingAdmin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });

      if (existingAdmin) {
        return NextResponse.json(
          { error: 'Un administrateur existe déjà' },
          { status: 400 }
        );
      }
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: isAdmin ? 'ADMIN' : 'USER'
      }
    });

    return NextResponse.json(
      { message: 'Compte créé avec succès', user: { email: user.email, role: user.role } },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}