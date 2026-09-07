import * as jwt from 'jsonwebtoken';
import * as express from 'express';

const SECRET = process.env.JWT_SECRET || 'superSecret';

const getTokenFromHeaders = (req: express.Request): string | null => {
  if (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

/**
 * VULNERABLE (API2:2023 - Broken Authentication):
 * El middleware decide el algoritmo y la clave a partir de la propia cabecera
 * del token (alg-confusion). Si el atacante envia {"alg":"none"} el servidor
 * verifica sin clave y acepta un token sin firma. Ademas no exige expiracion.
 * Resultado: se puede forjar un token con user.id arbitrario y suplantar a
 * cualquier usuario, incluido el administrador, sin conocer la clave secreta.
 */
const verifyVulnerable = (token: string): any => {
  const decoded: any = jwt.decode(token, { complete: true });
  const alg: string = decoded?.header?.alg || 'HS256';
  const key: string = alg === 'none' ? '' : SECRET;
  return jwt.verify(token, key, { algorithms: [alg as jwt.Algorithm] });
};

const unauthorized = (next: express.NextFunction) => {
  const err: any = new Error('missing authorization credentials');
  err.name = 'UnauthorizedError';
  next(err);
};

const auth = {
  required: (req: any, res: express.Response, next: express.NextFunction) => {
    const token = getTokenFromHeaders(req);
    if (!token) return unauthorized(next);
    try {
      req.auth = verifyVulnerable(token);
      next();
    } catch (err: any) {
      err.name = 'UnauthorizedError';
      next(err);
    }
  },
  optional: (req: any, res: express.Response, next: express.NextFunction) => {
    const token = getTokenFromHeaders(req);
    if (!token) return next();
    try {
      req.auth = verifyVulnerable(token);
    } catch {
      /* token invalido: continua como anonimo */
    }
    next();
  },
};

export default auth;
