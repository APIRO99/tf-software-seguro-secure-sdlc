import * as jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('JWT_SECRET no esta definido. Configure la clave de firma en el entorno.');
}

/**
 * REMEDIACION (API2:2023): firma HS256 con expiracion obligatoria. La clave se
 * toma solo del entorno; no hay valor por defecto embebido en el codigo.
 */
const generateToken = (id: number): string =>
  jwt.sign({ user: { id } }, SECRET as string, {
    algorithm: 'HS256',
    expiresIn: '1d',
  });

export default generateToken;
