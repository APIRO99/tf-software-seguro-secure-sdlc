import { expressjwt as jwt } from 'express-jwt';
import * as express from 'express';

/**
 * Clave de firma cargada exclusivamente desde el entorno.
 * Sin valor por defecto embebido: si falta, el arranque debe fallar.
 */
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('JWT_SECRET no esta definido. Configure la clave de firma en el entorno.');
}

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
 * REMEDIACION (API2:2023): el algoritmo se fija en el servidor (HS256), nunca se
 * deriva de la cabecera del token. Esto neutraliza alg:none y la confusion de
 * algoritmos. express-jwt rechaza automaticamente un token con exp vencido.
 */
const auth = {
  required: jwt({
    secret: SECRET,
    getToken: getTokenFromHeaders,
    algorithms: ['HS256'],
  }),
  optional: jwt({
    secret: SECRET,
    credentialsRequired: false,
    getToken: getTokenFromHeaders,
    algorithms: ['HS256'],
  }),
};

export default auth;
