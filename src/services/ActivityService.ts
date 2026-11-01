import Activity, { IActivity } from '../models/Activity';

export interface ActivityQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    category?: string;
    subcategory?: string;
    status?: string;
    showDeleted?: boolean;
    userRole?: string;
}

// Crear una actividad nueva
export const createActivity = (data: IActivity) => {
    const activity = new Activity(data);
    return activity.save();
};

// Obtener actividad por ID (Comprueba borrado según rol)
export const getActivityById = (activityId: string, userRole?: string) => {
    const filter: Record<string, unknown> = { _id: activityId };

    // Si NO es Admin, solo puede ver actividades activas
    if (userRole !== 'ADMIN') {
        filter.deleted = false;
    }

    return Activity.findOne(filter).populate('creatorId', 'name email avatarUrl');
};

// Listado paginado con filtros, ordenación y control de Soft Delete por Rol
export const getAllActivitiesPaginated = async (params: ActivityQueryParams) => {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    // Filtro dinámico
    const filter: Record<string, unknown> = {};

    // Control de Soft Delete según el rol JWT
    if (params.userRole !== 'ADMIN') {
        filter.deleted = false;
    } else if (params.showDeleted !== true) {
        // Por defecto, incluso para Admin, omitir borrados salvo que pida showDeleted=true
        filter.deleted = false;
    }

    // Filtros de búsqueda
    if (params.search) {
        filter.$or = [
            { title: { $regex: params.search, $options: 'i' } },
            { description: { $regex: params.search, $options: 'i' } },
            { 'location.addressName': { $regex: params.search, $options: 'i' } }
        ];
    }

    if (params.category) filter.category = params.category;
    if (params.subcategory) filter.subcategory = params.subcategory;
    if (params.status) filter.status = params.status;

    // Consultas a MongoDB
    const [activities, totalCount] = await Promise.all([
        Activity.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .populate('creatorId', 'name email avatarUrl'),
        Activity.countDocuments(filter)
    ]);

    return {
        activities,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
    };
};

// Actualizar una actividad
export const updateActivity = (activityId: string, data: Partial<IActivity>) => {
    return Activity.findOne({ _id: activityId, deleted: false }).then(async (activity) => {
        if (!activity) return null;
        Object.assign(activity, data);
        return activity.save();
    });
};

// Soft Delete unitario (borrado lógico)
export const softDeleteActivity = (activityId: string) => {
    return Activity.findByIdAndUpdate(activityId, { deleted: true, deletedAt: new Date() }, { new: true });
};

// Soft Delete masivo (bulk)
export const bulkSoftDeleteActivities = (ids: string[]) => {
    return Activity.updateMany({ _id: { $in: ids } }, { $set: { deleted: true, deletedAt: new Date() } });
};

// Hard Delete unitario (borrado físico)
export const hardDeleteActivity = (activityId: string) => {
    return Activity.findByIdAndDelete(activityId);
};

// Hard Delete masivo (bulk)
export const bulkHardDeleteActivities = (ids: string[]) => {
    return Activity.deleteMany({ _id: { $in: ids } });
};

export default {
    createActivity,
    getActivityById,
    getAllActivitiesPaginated,
    updateActivity,
    softDeleteActivity,
    bulkSoftDeleteActivities,
    hardDeleteActivity,
    bulkHardDeleteActivities
};
