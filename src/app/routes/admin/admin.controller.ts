import { NextFunction, Request, Response, Router } from 'express';
import auth from '../auth/auth';
import prisma from '../../../prisma/prisma-client';

const router = Router();

/**
 * Panel administrativo: lista todos los usuarios de la plataforma.
 * @route {GET} /admin/users
 *
 * VULNERABLE (A01:2021 - Broken Access Control):
 * Solo exige que exista una sesion valida (auth.required), pero no verifica
 * el rol del usuario. Cualquier usuario autenticado escala verticalmente y
 * accede al panel de administracion con datos de todos los usuarios.
 */
router.get('/admin/users', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true, role: true },
    });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

/**
 * Perfil privado de un miembro por id.
 * @route {GET} /members/:id
 *
 * VULNERABLE (API1:2023 - BOLA / IDOR):
 * Devuelve el recurso indicado por :id sin validar que pertenezca al usuario
 * autenticado. Cambiando el numero en la URL se accede al perfil privado
 * (correo, rol) de cualquier otro usuario.
 */
router.get('/members/:id', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true, email: true, username: true, role: true, bio: true },
    });
    res.json({ member });
  } catch (error) {
    next(error);
  }
});

/**
 * Busqueda de articulos por texto libre.
 * @route {GET} /articles-search?q=
 *
 * VULNERABLE (A03:2021 - Inyeccion SQL):
 * Concatena el parametro q directamente dentro de la sentencia SQL y la
 * ejecuta con $queryRawUnsafe. Permite alterar la logica de la consulta e
 * incluso extraer datos de otras tablas con UNION SELECT.
 */
router.get('/articles-search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q ?? '');
    const sql = `SELECT id, title, description FROM Article WHERE title LIKE '%${q}%'`;
    const rows = await prisma.$queryRawUnsafe(sql);
    res.json({ query: sql, results: rows });
  } catch (error) {
    next(error);
  }
});

export default router;
