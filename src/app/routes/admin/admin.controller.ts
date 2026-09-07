import { NextFunction, Request, Response, Router } from 'express';
import { Prisma } from '@prisma/client';
import auth from '../auth/auth';
import requireAdmin from './authorize';
import prisma from '../../../prisma/prisma-client';
import HttpException from '../../models/http-exception.model';

const router = Router();

/**
 * Panel administrativo: lista todos los usuarios de la plataforma.
 * @route {GET} /admin/users
 *
 * REMEDIACION (A01:2021 - Broken Access Control):
 * Se encadena requireAdmin despues de auth.required. Solo un usuario con rol
 * 'admin' accede al panel; un usuario normal recibe 403.
 */
router.get(
  '/admin/users',
  auth.required,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, username: true, role: true },
      });
      res.json({ users });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Perfil privado de un miembro por id.
 * @route {GET} /members/:id
 *
 * REMEDIACION (API1:2023 - BOLA / IDOR):
 * Se valida la propiedad contextual del recurso: el solicitante solo accede a
 * su propio perfil. Un administrador puede consultar cualquiera. En otro caso
 * se responde 403 sin revelar la existencia del recurso ajeno.
 */
router.get(
  '/members/:id',
  auth.required,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const requestedId = Number(req.params.id);
      const requesterId = Number(req.auth?.user?.id);

      const requester = await prisma.user.findUnique({
        where: { id: requesterId },
        select: { role: true },
      });

      if (requestedId !== requesterId && requester?.role !== 'admin') {
        throw new HttpException(403, { message: 'No autorizado para ver este recurso' });
      }

      const member = await prisma.user.findUnique({
        where: { id: requestedId },
        select: { id: true, email: true, username: true, role: true, bio: true },
      });
      res.json({ member });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Busqueda de articulos por texto libre.
 * @route {GET} /articles-search?q=
 *
 * REMEDIACION (A03:2021 - Inyeccion SQL):
 * La entrada del usuario viaja como parametro vinculado mediante la plantilla
 * etiquetada $queryRaw (Prisma.sql). El motor la trata como dato, no como codigo,
 * de modo que payloads UNION o comentarios SQL pierden efecto.
 */
router.get('/articles-search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q ?? '');
    const like = `%${q}%`;
    const rows = await prisma.$queryRaw(
      Prisma.sql`SELECT id, title, description FROM Article WHERE title LIKE ${like}`,
    );
    res.json({ results: rows });
  } catch (error) {
    next(error);
  }
});

export default router;
