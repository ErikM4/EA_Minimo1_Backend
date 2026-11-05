import { NextFunction, Request, Response } from 'express';
import WishlistService from '../services/WishlistService';

const createWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body.authorId = req.user!.id;
        const wishlist = await WishlistService.createWishlist(req.body);
        res.status(201).json({ wishlist });
    } catch (error) {
        next(error);
    }
};

const readWishlist = async (req: Request<{ wishlistId: string }>, res: Response, next: NextFunction) => {
    try {
        const result = await WishlistService.getWishlistById(req.params.wishlistId, req.user?.id, req.user?.role);

        if (result === 'FORBIDDEN') {
            return res.status(403).json({ message: 'No tienes permiso para acceder a esta wishlist privada' });
        }

        if (result) {
            return res.status(200).json({ wishlist: result });
        }

        return res.status(404).json({ message: 'Wishlist no encontrada' });
    } catch (error) {
        return next(error);
    }
};

const readAllPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await WishlistService.getAllWishlistsPaginated({
            page: Number(req.query.page),
            limit: Number(req.query.limit),
            sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
            search: req.query.search as string,
            isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
            activityId: req.query.activityId as string,
            showDeleted: req.query.showDeleted === 'true',
            userRole: req.user?.role,
            currentUserId: req.user?.id
        });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const updateWishlist = async (req: Request<{ wishlistId: string }>, res: Response, next: NextFunction) => {
    try {
        const result = await WishlistService.updateWishlist(req.params.wishlistId, req.body, req.user!.id, req.user?.role);

        if (result === 'FORBIDDEN') {
            return res.status(403).json({ message: 'No tienes permiso para modificar esta wishlist' });
        }

        if (result) {
            return res.status(200).json({ wishlist: result });
        }

        return res.status(404).json({ message: 'Wishlist no encontrada' });
    } catch (error) {
        return next(error);
    }
};

const addItem = async (req: Request<{ wishlistId: string }>, res: Response, next: NextFunction) => {
    try {
        const result = await WishlistService.addItemToWishlist(req.params.wishlistId, req.body, req.user!.id, req.user?.role);

        if (result === 'NOT_FOUND') {
            return res.status(404).json({ message: 'Wishlist no encontrada' });
        }

        if (result === 'ACTIVITY_NOT_FOUND') {
            return res.status(404).json({ message: 'La actividad indicada no existe en el sistema' });
        }

        if (result === 'FORBIDDEN') {
            return res.status(403).json({ message: 'No tienes permiso para añadir elementos a esta wishlist' });
        }

        if (result === 'CONFLICT') {
            return res.status(409).json({ message: 'La actividad ya existe en esta wishlist' });
        }

        return res.status(200).json({ wishlist: result });
    } catch (error) {
        return next(error);
    }
};

const removeItem = async (req: Request<{ wishlistId: string; activityId: string }>, res: Response, next: NextFunction) => {
    try {
        const result = await WishlistService.removeItemFromWishlist(req.params.wishlistId, req.params.activityId, req.user!.id, req.user?.role);

        if (result === 'NOT_FOUND') {
            return res.status(404).json({ message: 'Wishlist no encontrada' });
        }

        if (result === 'FORBIDDEN') {
            return res.status(403).json({ message: 'No tienes permiso para eliminar elementos de esta wishlist' });
        }

        if (result === 'ITEM_NOT_FOUND') {
            return res.status(404).json({ message: 'La actividad no se encuentra dentro de la wishlist' });
        }

        return res.status(200).json({ wishlist: result });
    } catch (error) {
        return next(error);
    }
};

const softDeleteWishlist = async (req: Request<{ wishlistId: string }>, res: Response, next: NextFunction) => {
    try {
        const result = await WishlistService.softDeleteWishlist(req.params.wishlistId, req.user!.id, req.user?.role);

        if (result === 'FORBIDDEN') {
            return res.status(403).json({ message: 'No tienes permiso para archivar esta wishlist' });
        }

        if (result) {
            return res.status(204).send();
        }

        return res.status(404).json({ message: 'Wishlist no encontrada' });
    } catch (error) {
        return next(error);
    }
};

const restoreWishlist = async (req: Request<{ wishlistId: string }>, res: Response, next: NextFunction) => {
    try {
        const result = await WishlistService.restoreWishlist(req.params.wishlistId, req.user?.role);

        if (result === 'FORBIDDEN') {
            return res.status(403).json({ message: 'Solo los administradores pueden restaurar wishlists archivadas' });
        }

        if (result) {
            return res.status(200).json({ wishlist: result });
        }

        return res.status(404).json({ message: 'Wishlist no encontrada' });
    } catch (error) {
        return next(error);
    }
};

const hardDeleteWishlist = async (req: Request<{ wishlistId: string }>, res: Response, next: NextFunction) => {
    try {
        const result = await WishlistService.hardDeleteWishlist(req.params.wishlistId, req.user!.id, req.user?.role);

        if (result === 'FORBIDDEN') {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta wishlist' });
        }

        if (result) {
            return res.status(204).send();
        }

        return res.status(404).json({ message: 'Wishlist no encontrada' });
    } catch (error) {
        return next(error);
    }
};

export default {
    createWishlist,
    readWishlist,
    readAllPaginated,
    updateWishlist,
    addItem,
    removeItem,
    softDeleteWishlist,
    restoreWishlist,
    hardDeleteWishlist
};
