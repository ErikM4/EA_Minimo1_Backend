import { NextFunction, Request, Response } from 'express';
import UserService from '../services/UserService';
import { UserRole } from '../models/User';

// Devuelve el usuario con sesión a partir del token en req.user
const readMe = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        res.status(401).json({ message: 'Falta el token' });
        return;
    }

    try {
        const user = await UserService.getUserById(req.user.id, req.user.role);

        if (user) {
            res.status(200).json({ user });
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

// ----------------------------------------------------------------------------
// ENDPOINTS CRUD Y BACKOFFICE (Paginación, Filtros y Soft Delete)
// ----------------------------------------------------------------------------

// Crear usuario nuevo (Alta directa desde Admin o Registro)
const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.createUser(req.body);
        res.status(201).json({ user });
    } catch (error) {
        next(error);
    }
};

// Leer usuario por ID
const readUser = async (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const userRole = req.user?.role;

    try {
        const user = await UserService.getUserById(userId, userRole);
        if (user) {
            res.status(200).json({ user });
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Leer usuarios paginados con filtros (Tabla Backoffice)
const readAllPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await UserService.getAllUsersPaginated({
            page: Number(req.query.page),
            limit: Number(req.query.limit),
            sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
            search: req.query.search as string,
            role: req.query.role as UserRole,
            isBanned: req.query.isBanned === 'true' ? true : req.query.isBanned === 'false' ? false : undefined,
            showDeleted: req.query.showDeleted === 'true',
            userRole: req.user?.role
        });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Actualizar datos de usuario
const updateUser = async (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    try {
        const user = await UserService.updateUser(userId, req.body);
        if (user) {
            res.status(200).json({ user });
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Soft Delete unitario (borrado lógico)
const softDeleteUser = async (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    try {
        const user = await UserService.softDeleteUser(userId);
        if (user) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Soft Delete masivo (bulk)
const bulkSoftDelete = async (req: Request<{}, {}, { ids: string[] }>, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: 'Se requiere un array de IDs' });
            return;
        }

        await UserService.bulkSoftDeleteUsers(ids);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Restaurar usuario (Solo Admin)
const restoreUser = async (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    try {
        const user = await UserService.restoreUser(userId);
        if (user) {
            res.status(200).json({ user });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        next(error);
    }
};

// Hard Delete unitario (borrado físico)
const hardDeleteUser = async (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    try {
        const user = await UserService.hardDeleteUser(userId);
        if (user) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Hard Delete masivo (bulk)
const bulkHardDelete = async (req: Request<{}, {}, { ids: string[] }>, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: 'Se requiere un array de IDs' });
            return;
        }

        await UserService.bulkHardDeleteUsers(ids);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export default {
    readMe,
    createUser,
    readUser,
    readAllPaginated,
    updateUser,
    restoreUser,
    softDeleteUser,
    bulkSoftDelete,
    hardDeleteUser,
    bulkHardDelete
};
