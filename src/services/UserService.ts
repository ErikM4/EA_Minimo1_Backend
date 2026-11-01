import User, { IUser, UserRole } from '../models/User';

export interface IUserSummary {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    deleted: boolean;
}

export interface IUserProfile {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    bio?: string;
    isBanned: boolean;
    deleted: boolean;
    deletedAt?: Date | null;
}

export interface UserQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    role?: UserRole;
    isBanned?: boolean;
    showDeleted?: boolean;
    userRole?: string;
}

// Crear un usuario nuevo
export const createUser = (data: IUser) => {
    const user = new User(data);
    return user.save();
};

// Buscar usuario por su ID (Para GET /users/me o detalle en Backoffice)
export const getUserById = async (userId: string, userRole?: string): Promise<IUserProfile | null> => {
    const filter: Record<string, unknown> = { _id: userId };

    // Si NO es Admin, solo consulta usuarios activos
    if (userRole !== 'ADMIN') {
        filter.deleted = false;
    }

    const user = await User.findOne(filter);
    if (!user) return null;

    return {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isBanned: user.isBanned,
        deleted: user.deleted,
        deletedAt: user.deletedAt
    };
};

// Listado paginado de usuarios con filtros, ordenación y Soft Delete por Rol
export const getAllUsersPaginated = async (params: UserQueryParams) => {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const filter: Record<string, unknown> = {};

    // Control de Soft Delete según rol JWT
    if (params.userRole !== 'ADMIN') {
        filter.deleted = false;
    } else if (params.showDeleted !== true) {
        filter.deleted = false;
    }

    // Búsqueda por texto (nombre o email)
    if (params.search) {
        filter.$or = [{ name: { $regex: params.search, $options: 'i' } }, { email: { $regex: params.search, $options: 'i' } }];
    }

    if (params.role) filter.role = params.role;
    if (params.isBanned !== undefined) filter.isBanned = params.isBanned;

    const [users, totalCount] = await Promise.all([
        User.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit),
        User.countDocuments(filter)
    ]);

    // Mapeamos a IUserSummary
    const summaries: IUserSummary[] = users.map((user) => ({
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        deleted: user.deleted
    }));

    return {
        users: summaries,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
    };
};

// Actualizar un usuario
export const updateUser = (userId: string, data: Partial<IUser>) => {
    return User.findOne({ _id: userId, deleted: false }).then(async (user) => {
        if (!user) return null;
        Object.assign(user, data);
        return user.save();
    });
};

//Restaurar un usuario borrado (Soft Delete) por su ID
export const restoreUser = (userId: string) => {
    return User.findByIdAndUpdate(userId, { deleted: false, deletedAt: null }, { new: true });
};

// Soft Delete unitario (borrado lógico)
export const softDeleteUser = (userId: string) => {
    return User.findByIdAndUpdate(userId, { deleted: true, deletedAt: new Date() }, { new: true });
};

// Soft Delete masivo (bulk)
export const bulkSoftDeleteUsers = (ids: string[]) => {
    return User.updateMany({ _id: { $in: ids } }, { $set: { deleted: true, deletedAt: new Date() } });
};

// Hard Delete unitario (borrado físico)
export const hardDeleteUser = (userId: string) => {
    return User.findByIdAndDelete(userId);
};

// Hard Delete masivo (bulk)
export const bulkHardDeleteUsers = (ids: string[]) => {
    return User.deleteMany({ _id: { $in: ids } });
};

export default {
    createUser,
    getUserById,
    getAllUsersPaginated,
    updateUser,
    restoreUser,
    softDeleteUser,
    bulkSoftDeleteUsers,
    hardDeleteUser,
    bulkHardDeleteUsers
};
