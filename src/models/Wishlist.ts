import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistItem {
    activityId: mongoose.Types.ObjectId | string;
    notes?: string;
    priority: number;
    addedAt: Date;
}

export interface IWishlist {
    authorId: mongoose.Types.ObjectId | string;
    name: string;
    description?: string;
    isPublic: boolean;
    items: IWishlistItem[];
    deleted: boolean;
    deletedAt?: Date | null;
}

export interface IWishlistModel extends IWishlist, Document {}

const WishlistItemSchema: Schema = new Schema(
    {
        activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
        notes: { type: String, trim: true, default: '' },
        priority: { type: Number, default: 1, min: 1, max: 5 },
        addedAt: { type: Date, default: Date.now }
    },
    { _id: true }
);

const WishlistSchema: Schema = new Schema(
    {
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        isPublic: { type: Boolean, default: true },
        items: [WishlistItemSchema],
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

WishlistSchema.index({ authorId: 1, deleted: 1 });

export default mongoose.model<IWishlistModel>('Wishlist', WishlistSchema);
