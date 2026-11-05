import mongoose from 'mongoose';
import Wishlist, { IWishlist } from '../models/Wishlist';
import Activity from '../models/Activity';

export interface WishlistQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    isPublic?: boolean;
    activityId?: string;
    showDeleted?: boolean;
    userRole?: string;
    currentUserId?: string;
}

export const createWishlist = (data: Partial<IWishlist>) => {
    const wishlist = new Wishlist(data);
    return wishlist.save();
};

export const getWishlistById = async (wishlistId: string, currentUserId?: string, userRole?: string) => {
    const filter: Record<string, unknown> = { _id: wishlistId };

    if (userRole !== 'ADMIN') {
        filter.deleted = false;
    }

    const wishlist = await Wishlist.findOne(filter).populate('authorId', 'name email avatarUrl').populate('items.activityId', 'title category subcategory location schedule status pricing');

    if (!wishlist) return null;

    const authorIdStr = typeof wishlist.authorId === 'object' && wishlist.authorId !== null && '_id' in wishlist.authorId ? String(wishlist.authorId._id) : String(wishlist.authorId);

    if (userRole !== 'ADMIN' && !wishlist.isPublic && authorIdStr !== currentUserId) {
        return 'FORBIDDEN';
    }

    return wishlist;
};

export const getAllWishlistsPaginated = async (params: WishlistQueryParams) => {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const filter: Record<string, unknown> = {};

    if (params.userRole !== 'ADMIN' || params.showDeleted !== true) {
        filter.deleted = false;
    }

    if (params.userRole !== 'ADMIN') {
        filter.$or = [{ isPublic: true }, { authorId: params.currentUserId }];
    }

    if (params.search) {
        const searchRegex = { $regex: params.search, $options: 'i' };
        const searchConditions = [{ name: searchRegex }, { description: searchRegex }];

        if (filter.$or) {
            filter.$and = [{ $or: filter.$or as Record<string, unknown>[] }, { $or: searchConditions }];
            delete filter.$or;
        } else {
            filter.$or = searchConditions;
        }
    }

    if (params.isPublic !== undefined) filter.isPublic = params.isPublic;
    if (params.activityId) filter['items.activityId'] = params.activityId;

    const [wishlists, totalCount] = await Promise.all([
        Wishlist.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .populate('authorId', 'name email avatarUrl')
            .populate('items.activityId', 'title category subcategory location schedule status pricing'),
        Wishlist.countDocuments(filter)
    ]);

    return {
        data: wishlists,
        totalDocs: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
    };
};

export const updateWishlist = async (wishlistId: string, data: Partial<IWishlist>, currentUserId: string, userRole?: string) => {
    const wishlist = await Wishlist.findOne({ _id: wishlistId, deleted: false });
    if (!wishlist) return null;

    if (userRole !== 'ADMIN' && String(wishlist.authorId) !== currentUserId) {
        return 'FORBIDDEN';
    }

    Object.assign(wishlist, data);
    return wishlist.save();
};

export const addItemToWishlist = async (wishlistId: string, item: { activityId: string; notes?: string; priority?: number }, currentUserId: string, userRole?: string) => {
    const wishlist = await Wishlist.findOne({ _id: wishlistId, deleted: false });
    if (!wishlist) return 'NOT_FOUND';

    if (userRole !== 'ADMIN' && String(wishlist.authorId) !== currentUserId) {
        return 'FORBIDDEN';
    }

    const activityExists = await Activity.exists({ _id: item.activityId, deleted: false });
    if (!activityExists) return 'ACTIVITY_NOT_FOUND';

    const exists = wishlist.items.some((i) => String(i.activityId) === item.activityId);
    if (exists) return 'CONFLICT';

    wishlist.items.push({
        activityId: new mongoose.Types.ObjectId(item.activityId),
        notes: item.notes || '',
        priority: item.priority || 1,
        addedAt: new Date()
    });

    await wishlist.save();
    return getWishlistById(wishlistId, currentUserId, userRole);
};

export const removeItemFromWishlist = async (wishlistId: string, activityId: string, currentUserId: string, userRole?: string) => {
    const wishlist = await Wishlist.findOne({ _id: wishlistId, deleted: false });
    if (!wishlist) return 'NOT_FOUND';

    if (userRole !== 'ADMIN' && String(wishlist.authorId) !== currentUserId) {
        return 'FORBIDDEN';
    }

    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter((i) => String(i.activityId) !== activityId);

    if (wishlist.items.length === initialLength) {
        return 'ITEM_NOT_FOUND';
    }

    await wishlist.save();
    return getWishlistById(wishlistId, currentUserId, userRole);
};

export const softDeleteWishlist = async (wishlistId: string, currentUserId: string, userRole?: string) => {
    const wishlist = await Wishlist.findOne({ _id: wishlistId, deleted: false });
    if (!wishlist) return null;

    if (userRole !== 'ADMIN' && String(wishlist.authorId) !== currentUserId) {
        return 'FORBIDDEN';
    }

    wishlist.deleted = true;
    wishlist.deletedAt = new Date();
    return wishlist.save();
};

export const restoreWishlist = async (wishlistId: string, userRole?: string) => {
    if (userRole !== 'ADMIN') return 'FORBIDDEN';
    return Wishlist.findByIdAndUpdate(wishlistId, { deleted: false, deletedAt: null }, { new: true });
};

export const hardDeleteWishlist = async (wishlistId: string, currentUserId: string, userRole?: string) => {
    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) return null;

    if (userRole !== 'ADMIN' && String(wishlist.authorId) !== currentUserId) {
        return 'FORBIDDEN';
    }

    return Wishlist.findByIdAndDelete(wishlistId);
};

export default {
    createWishlist,
    getWishlistById,
    getAllWishlistsPaginated,
    updateWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    softDeleteWishlist,
    restoreWishlist,
    hardDeleteWishlist
};
