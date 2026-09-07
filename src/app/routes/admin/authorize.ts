import { NextFunction, Request, Response } from 'express';
import prisma from '../../../prisma/prisma-client';
import HttpException from '../../models/http-exception.model';

/**
 * REMEDIACION (A01:2021): control de acceso basado en rol (RBAC). Verifica en la
 * base de datos que el usuario autenticado tenga rol 'admin' antes de permitir
 * el acceso a recursos administrativos. Se aplica despues de auth.required.
 */
const requireAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.user?.id;
    if (!userId) {
      throw new HttpException(401, { message: 'No autenticado' });
    }
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      throw new HttpException(403, { message: 'Acceso restringido a administradores' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default requireAdmin;
