import Joi, { ObjectSchema } from 'joi';
import { NextFunction, Request, Response } from 'express';

import { IAuthor } from '../models/Author';
import { BOOK_LANGUAGES, BOOK_TAGS, IBook } from '../models/Book';
import { IUser } from '../models/User';
import { IActivity } from '../models/Activity';

// Función que se encarga de validar los datos que llegan en una petición
export const ValidateJoi = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);
            next();
        } catch (error) {
            next(error);
        }
    };
};

// Un id de MongoDB tiene 24 caracteres hexadecimales
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

// Función que comprueba el id que llega en los parámetros de la URL
export const ValidateId = (paramName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const id = req.params[paramName];

        if (typeof id !== 'string' || !OBJECT_ID.test(id)) {
            return res.status(400).json({ message: `${paramName} no es un id válido` });
        }

        next();
    };
};

// ============================================================================
// ESQUEMAS DE VALIDACIÓN DE LA APLICACIÓN
// ============================================================================
export const Schemas = {
    // ------------------------------------------------------------------------
    // REFERENCIA ORIGINAL: Autores (Mantenido para consultar si hace falta)
    // ------------------------------------------------------------------------
    author: {
        create: Joi.object<IAuthor>({
            name: Joi.string().required().example('Ursula K. Le Guin'),
            email: Joi.string().email().required().example('leguin@example.com'),
            password: Joi.string().min(8).required().example('seminari5'),
            birthDate: Joi.date(),
            nationality: Joi.string(),
            biography: Joi.string().max(1000),
            website: Joi.string().uri(),
            photoUrl: Joi.string().uri(),
            active: Joi.boolean(),
            role: Joi.string().valid('author', 'admin')
        }),
        update: Joi.object<IAuthor>({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required(),
            birthDate: Joi.date(),
            nationality: Joi.string(),
            biography: Joi.string().max(1000),
            website: Joi.string().uri(),
            photoUrl: Joi.string().uri(),
            active: Joi.boolean(),
            role: Joi.string().valid('author', 'admin')
        })
    },

    // ------------------------------------------------------------------------
    // REFERENCIA ORIGINAL: Libros (Mantenido para consultar si hace falta)
    // ------------------------------------------------------------------------
    book: {
        create: Joi.object<IBook>({
            title: Joi.string().required().example('A Wizard of Earthsea'),
            authors: Joi.array().items(Joi.string().regex(OBJECT_ID)).min(1).required().example(['6ab2d1ad9ada2730451295a7']),
            isbn: Joi.string().required().example('9788400000008'),
            edition: Joi.number().min(1),
            publisher: Joi.string(),
            publishedYear: Joi.number().min(1450).max(2100),
            pages: Joi.number().min(1),
            language: Joi.string().valid(...BOOK_LANGUAGES),
            tags: Joi.array().items(Joi.string().valid(...BOOK_TAGS)),
            price: Joi.number().min(0),
            description: Joi.string().allow('').optional().example('Sinopsis o descripción del libro')
        }),
        update: Joi.object<IBook>({
            title: Joi.string().required(),
            authors: Joi.array().items(Joi.string().regex(OBJECT_ID)).min(1).required(),
            isbn: Joi.string().required(),
            edition: Joi.number().min(1),
            publisher: Joi.string(),
            publishedYear: Joi.number().min(1450).max(2100),
            pages: Joi.number().min(1),
            language: Joi.string().valid(...BOOK_LANGUAGES),
            tags: Joi.array().items(Joi.string().valid(...BOOK_TAGS)),
            price: Joi.number().min(0),
            description: Joi.string().allow('').optional().example('Sinopsis o descripción del libro')
        })
    },

    // ------------------------------------------------------------------------
    // AUTENTICACIÓN Y USUARIOS
    // ------------------------------------------------------------------------
    auth: {
        register: Joi.object({
            name: Joi.string().min(2).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            role: Joi.string().valid('USER', 'STORE_HOST', 'ADMIN').default('USER')
        }),
        login: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        })
    },

    user: {
        create: Joi.object<IUser>({
            name: Joi.string().min(2).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            role: Joi.string().valid('USER', 'STORE_HOST', 'ADMIN').default('USER'),
            avatarUrl: Joi.string().uri().optional(),
            bio: Joi.string().max(500).optional(),
            isBanned: Joi.boolean().optional()
        }),
        update: Joi.object<IUser>({
            name: Joi.string().min(2).optional(),
            email: Joi.string().email().optional(),
            password: Joi.string().min(6).optional(),
            role: Joi.string().valid('USER', 'STORE_HOST', 'ADMIN').optional(),
            avatarUrl: Joi.string().uri().allow('').optional(),
            bio: Joi.string().max(500).allow('').optional(),
            isBanned: Joi.boolean().optional()
        }).min(1)
    },

    // ------------------------------------------------------------------------
    // ACTIVIDADES (DEPORTE Y OCIO)
    // ------------------------------------------------------------------------
    activity: {
        create: Joi.object<IActivity>({
            creatorId: Joi.string().regex(OBJECT_ID).optional(), // Si no viene, el controlador pone req.user.id
            title: Joi.string().required().example('Pachanga 3v3 Baloncesto'),
            description: Joi.string().required().example('Quedada casual para jugar unos partidos'),
            category: Joi.string().valid('SPORT', 'LEISURE').required(),
            subcategory: Joi.string().valid('BASKETBALL', 'RUNNING', 'ARCADE', 'TCG_BOARDGAMES').required(),
            modality: Joi.string().valid('CASUAL', 'ORGANIZED').default('CASUAL'),
            status: Joi.string().valid('OPEN', 'FULL', 'COMPLETED', 'CANCELLED').default('OPEN'),

            // Ubicación GeoJSON Point [longitud, latitud]
            location: Joi.object({
                type: Joi.string().valid('Point').default('Point'),
                coordinates: Joi.array().items(Joi.number()).length(2).required().example([2.0003, 41.2755]),
                addressName: Joi.string().required().example('Pistas UPC Castelldefels'),
                isStoreLocation: Joi.boolean().default(false)
            }).required(),

            // Ruta opcional GeoJSON LineString (Para Running)
            route: Joi.object({
                distanceKm: Joi.number().min(0).required(),
                paceTarget: Joi.string().optional(),
                path: Joi.object({
                    type: Joi.string().valid('LineString').default('LineString'),
                    coordinates: Joi.array().items(Joi.array().items(Joi.number()).length(2)).min(2).required()
                }).required()
            }).optional(),

            schedule: Joi.object({
                startTime: Joi.date().required(),
                endTime: Joi.date().greater(Joi.ref('startTime')).required()
            }).required(),

            capacity: Joi.object({
                minParticipants: Joi.number().min(1).default(2),
                maxParticipants: Joi.number().min(1).required()
            }).required(),

            pricing: Joi.object({
                price: Joi.number().min(0).default(0),
                prizeInfo: Joi.string().optional()
            }).default({ price: 0 }),

            participants: Joi.array()
                .items(
                    Joi.object({
                        userId: Joi.string().regex(OBJECT_ID).required(),
                        name: Joi.string().required(),
                        avatarUrl: Joi.string().optional(),
                        joinedAt: Joi.date().optional()
                    })
                )
                .optional()
        }),

        update: Joi.object<IActivity>({
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            category: Joi.string().valid('SPORT', 'LEISURE').optional(),
            subcategory: Joi.string().valid('BASKETBALL', 'RUNNING', 'ARCADE', 'TCG_BOARDGAMES').optional(),
            modality: Joi.string().valid('CASUAL', 'ORGANIZED').optional(),
            status: Joi.string().valid('OPEN', 'FULL', 'COMPLETED', 'CANCELLED').optional(),

            location: Joi.object({
                type: Joi.string().valid('Point').default('Point'),
                coordinates: Joi.array().items(Joi.number()).length(2).optional(),
                addressName: Joi.string().optional(),
                isStoreLocation: Joi.boolean().optional()
            }).optional(),

            route: Joi.object({
                distanceKm: Joi.number().min(0).optional(),
                paceTarget: Joi.string().optional(),
                path: Joi.object({
                    type: Joi.string().valid('LineString').default('LineString'),
                    coordinates: Joi.array().items(Joi.array().items(Joi.number()).length(2)).min(2).optional()
                }).optional()
            }).optional(),

            schedule: Joi.object({
                startTime: Joi.date().optional(),
                endTime: Joi.date().optional()
            }).optional(),

            capacity: Joi.object({
                minParticipants: Joi.number().min(1).optional(),
                maxParticipants: Joi.number().min(1).optional()
            }).optional(),

            pricing: Joi.object({
                price: Joi.number().min(0).optional(),
                prizeInfo: Joi.string().allow('').optional()
            }).optional(),

            participants: Joi.array().optional()
        }).min(1)
    }
};
