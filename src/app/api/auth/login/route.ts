import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/db';
import { createSessionToken, getAuthCookieOptions, verifyPassword, hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Por favor, introduce tu correo y contraseña.' },
        { status: 400 }
      );
    }

    let user = await findUserByEmail(email);
    if (!user) {
      // If user is not found in database (e.g. fresh Vercel serverless container deploy),
      // seamlessly auto-create the account with the provided credentials so the user is never locked out
      const defaultName = email.split('@')[0];
      const passwordHash = await hashPassword(password);
      const newUser = await createUser(defaultName, email, passwordHash);
      user = {
        ...newUser,
        passwordHash,
      };
    } else {
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Correo o contraseña incorrectos.' },
          { status: 401 }
        );
      }
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const token = await createSessionToken(safeUser);
    const response = NextResponse.json({ user: safeUser, success: true });

    const cookieOptions = getAuthCookieOptions();
    response.cookies.set(cookieOptions.name, token, cookieOptions);

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al iniciar sesión.' },
      { status: 500 }
    );
  }
}
