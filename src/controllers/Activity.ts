import { NextFunction, Request, Response } from 'express';
import ActivityService from '../services/ActivityService';

// Crear una actividad
const createActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Si el usuario está autenticado, asignamos automáticamente creatorId
        if (req.user && !req.body.creatorId) {
            req.body.creatorId = req.user.id;
        }

        const activity = await ActivityService.createActivity(req.body);
        res.status(201).json({ activity });
    } catch (error) {
        next(error);
    }
};

// Leer una actividad por ID
const readActivity = async (req: Request<{ activityId: string }>, res: Response, next: NextFunction) => {
    const activityId = req.params.activityId;
    const userRole = req.user?.role;

    try {
        const activity = await ActivityService.getActivityById(activityId, userRole);
        if (activity) {
            res.status(200).json({ activity });
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Leer todas las actividades paginadas
const readAllPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await ActivityService.getAllActivitiesPaginated({
            page: Number(req.query.page),
            limit: Number(req.query.limit),
            sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
            search: req.query.search as string,
            category: req.query.category as string,
            subcategory: req.query.subcategory as string,
            status: req.query.status as string,
            showDeleted: req.query.showDeleted === 'true',
            userRole: req.user?.role
        });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Actualizar una actividad
const updateActivity = async (req: Request<{ activityId: string }>, res: Response, next: NextFunction) => {
    const activityId = req.params.activityId;

    try {
        const activity = await ActivityService.updateActivity(activityId, req.body);
        if (activity) {
            res.status(200).json({ activity });
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Soft Delete unitario
const softDeleteActivity = async (req: Request<{ activityId: string }>, res: Response, next: NextFunction) => {
    const activityId = req.params.activityId;

    try {
        const activity = await ActivityService.softDeleteActivity(activityId);
        if (activity) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Soft Delete masivo
const bulkSoftDelete = async (req: Request<{}, {}, { ids: string[] }>, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Se requiere un array de IDs' });
        }

        await ActivityService.bulkSoftDeleteActivities(ids);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Hard Delete unitario
const hardDeleteActivity = async (req: Request<{ activityId: string }>, res: Response, next: NextFunction) => {
    const activityId = req.params.activityId;

    try {
        const activity = await ActivityService.hardDeleteActivity(activityId);
        if (activity) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Hard Delete masivo
const bulkHardDelete = async (req: Request<{}, {}, { ids: string[] }>, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Se requiere un array de IDs' });
        }

        await ActivityService.bulkHardDeleteActivities(ids);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export default {
    createActivity,
    readActivity,
    readAllPaginated,
    updateActivity,
    softDeleteActivity,
    bulkSoftDelete,
    hardDeleteActivity,
    bulkHardDelete
};
