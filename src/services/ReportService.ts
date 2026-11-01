import Report, { IReport, ReportReason, ReportStatus, ReportTargetType } from '../models/Report';

export interface ReportQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: ReportStatus;
    reason?: ReportReason;
    targetType?: ReportTargetType;
    showDeleted?: boolean;
    userRole?: string;
}

// Crear un nuevo reporte (Enviado por un usuario)
export const createReport = (data: IReport) => {
    const report = new Report(data);
    return report.save();
};

// Obtener un reporte por ID
export const getReportById = (reportId: string, userRole?: string) => {
    const filter: Record<string, unknown> = { _id: reportId };

    if (userRole !== 'ADMIN') {
        filter.deleted = false;
    }

    return Report.findOne(filter).populate('reporterId', 'name email avatarUrl').populate('targetId');
};

// Listado paginado de reportes con filtros y control de Soft Delete por Rol
export const getAllReportsPaginated = async (params: ReportQueryParams) => {
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

    if (params.status) filter.status = params.status;
    if (params.reason) filter.reason = params.reason;
    if (params.targetType) filter.targetType = params.targetType;

    const [reports, totalCount] = await Promise.all([
        Report.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .populate('reporterId', 'name email avatarUrl'),
        Report.countDocuments(filter)
    ]);

    return {
        reports,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
    };
};

// Actualizar el estado o notas de un reporte (Uso principal en Backoffice)
export const updateReport = (reportId: string, data: Partial<IReport>) => {
    return Report.findOne({ _id: reportId, deleted: false }).then(async (report) => {
        if (!report) return null;
        Object.assign(report, data);
        return report.save();
    });
};

// Soft Delete unitario (Archivar reporte)
export const softDeleteReport = (reportId: string) => {
    return Report.findByIdAndUpdate(reportId, { deleted: true, deletedAt: new Date() }, { new: true });
};

// Soft Delete masivo (bulk)
export const bulkSoftDeleteReports = (ids: string[]) => {
    return Report.updateMany({ _id: { $in: ids } }, { $set: { deleted: true, deletedAt: new Date() } });
};

// Hard Delete unitario (borrado físico)
export const hardDeleteReport = (reportId: string) => {
    return Report.findByIdAndDelete(reportId);
};

// Hard Delete masivo (bulk)
export const bulkHardDeleteReports = (ids: string[]) => {
    return Report.deleteMany({ _id: { $in: ids } });
};

export default {
    createReport,
    getReportById,
    getAllReportsPaginated,
    updateReport,
    softDeleteReport,
    bulkSoftDeleteReports,
    hardDeleteReport,
    bulkHardDeleteReports
};
