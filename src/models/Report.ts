import mongoose, { Document, Schema } from 'mongoose';

export type ReportTargetType = 'ACTIVITY' | 'USER';
export type ReportReason = 'SPAM' | 'INAPPROPRIATE' | 'NO_SHOW' | 'FAKE_LOCATION' | 'OTHER';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface IReport {
    reporterId: mongoose.Types.ObjectId | string;
    targetType: ReportTargetType;
    targetId: mongoose.Types.ObjectId | string;
    reason: ReportReason;
    description: string;
    status: ReportStatus;
    adminNotes?: string;

    deleted: boolean;
    deletedAt?: Date;
}

export interface IReportModel extends IReport, Document {}

const ReportSchema: Schema = new Schema(
    {
        reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        targetType: { type: String, enum: ['ACTIVITY', 'USER'], required: true },
        targetId: { type: Schema.Types.ObjectId, required: true }, // Apunta dinámicamente a User o Activity
        reason: {
            type: String,
            enum: ['SPAM', 'INAPPROPRIATE', 'NO_SHOW', 'FAKE_LOCATION', 'OTHER'],
            required: true
        },
        description: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'],
            default: 'PENDING'
        },
        adminNotes: { type: String, trim: true },

        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model<IReportModel>('Report', ReportSchema);
