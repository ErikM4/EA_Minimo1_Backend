import path from 'node:path';
import swaggerJsdoc from 'swagger-jsdoc';
import j2s from 'joi-to-swagger';
import { Schemas } from '../middleware/Joi';
import { config } from './config';

// La documentación de cada endpoint está escrita en un comentario /** @openapi */
// encima de su ruta, en src/routes/. Aquí solo se montan las piezas comunes.

// Los esquemas del body salen de los mismos esquemas de Joi que validan las
// peticiones, así que no se pueden quedar desfasados.
const { swagger: registerInput } = j2s(Schemas.auth.register);
const { swagger: loginInput } = j2s(Schemas.auth.login);
const { swagger: userInput } = j2s(Schemas.user.create);
const { swagger: userUpdateInput } = j2s(Schemas.user.update);

// Lo que devuelve la API no es igual a lo que se envía: lleva el _id y las fechas que
// pone MongoDB, ni el autor ni el usuario devuelven la contraseña, y el libro trae sus autores enteros.
const storedFields = {
    _id: { type: 'string', example: '6ab3f2fe9c500204a7d5f80b' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

// El usuario nunca devuelve la contraseña ni el refreshTokenHash
const { password: _userPassword, ...userFields } = userInput.properties;

const userSchema = { type: 'object', properties: { ...storedFields, ...userFields } };

// Ejemplos que se ven en la página de Swagger, sacados de los datos de npm run seed

const userExample = {
    _id: '6ab3f2fe9c500204a7d5f8aa',
    name: 'Ana López',
    email: 'ana@example.com',
    role: 'user',
    createdAt: '2026-10-28T10:00:00.000Z',
    updatedAt: '2026-10-28T10:00:00.000Z'
};

// Una respuesta correcta: el esquema de lo que se devuelve y un ejemplo con datos de verdad
const okResponse = (description: string, schema: object, example: object) => ({
    description,
    content: { 'application/json': { schema, example } }
});

// Una respuesta de error: siempre un message, con un ejemplo del mensaje real
const errorResponse = (description: string, message: string) => ({
    description,
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: { message: { type: 'string' } }
            },
            example: { message }
        }
    }
});

const swaggerPath = (filePath: string) => filePath.replace(/\\/g, '/');

const swaggerDocument = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'API de autores, libros y usuarios (Node.js, Express, TypeScript y MongoDB), con autenticación JWT.'
        },
        servers: [{ url: `http://localhost:${config.server.port}` }],
        tags: [
            { name: 'Health', description: 'Comprobar que la API responde' },
            { name: 'Auth', description: 'Registro, inicio y cierre de sesión' },
            { name: 'Users', description: 'Gestión de usuarios (solo admin)' }
        ],
        // Pone el candado en todas las rutas. Las de /auth y /ping lo quitan con security: []
        security: [{ bearerAuth: [] }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            },
            schemas: {
                RegisterInput: registerInput,
                LoginInput: loginInput,
                UserInput: userInput,
                UserUpdateInput: userUpdateInput,
                User: userSchema
            },
            responses: {
                UserOne: okResponse('Un usuario', { type: 'object', properties: { user: userSchema } }, { user: userExample }),
                UserList: okResponse('La lista de usuarios', { type: 'object', properties: { users: { type: 'array', items: userSchema } } }, { users: [userExample] }),
                LoginOk: okResponse(
                    'Sesión iniciada. El refresh token llega en una cookie HttpOnly',
                    { type: 'object', properties: { token: { type: 'string' }, user: userSchema } },
                    { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', user: userExample }
                ),
                BadRequest: errorResponse('El id de la URL no tiene forma de id de MongoDB', 'userId no es un id válido'),
                BadCredentials: errorResponse('Email o contraseña incorrectos', 'Email o contraseña incorrectos'),
                Unauthorized: errorResponse('Falta el token, está caducado o no es válido', 'Falta el token'),
                Forbidden: errorResponse('El usuario no tiene el rol necesario (hace falta admin)', 'No tienes permiso para hacer esto'),
                NotFound: errorResponse('No existe ningún recurso con ese id', 'not found'),
                Conflict: errorResponse('Ya existe otro recurso con ese email', 'email ya existe'),
                Unprocessable: errorResponse('El body no cumple el esquema', '"email" is required'),
                ServerError: errorResponse('Error inesperado del servidor', 'Internal server error')
            }
        }
    },

    apis: [
        swaggerPath(path.join(__dirname, '../routes/*.ts')),
        swaggerPath(path.join(__dirname, '../routes/*.js')),
        swaggerPath(path.join(__dirname, '../server.ts')),
        swaggerPath(path.join(__dirname, '../server.js'))
    ]
});

export default swaggerDocument;
