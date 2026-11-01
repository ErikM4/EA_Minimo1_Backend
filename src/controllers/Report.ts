import { NextFunction, Request, Response } from 'express';
import ReportService from '../services/ReportService';
import { ReportReason, ReportStatus, ReportTargetType } from '../models/Report';

// Crear un reporte
const createReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user && !req.body.reporterId) {
            req.body.reporterId = req.user.id;
        }

        const report = await ReportService.createReport(req.body);
        res.status(201).json({ report });
    } catch (error) {
        next(error);
    }
};

// Leer reporte por ID
const readReport = async (req: Request<{ reportId: string }>, res: Response, next: NextFunction) => {
    const reportId = req.params.reportId;
    const userRole = req.user?.role;

    try {
        const report = await ReportService.getReportById(reportId, userRole);
        if (report) {
            res.status(200).json({ report });
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Leer todos los reportes paginados (Backoffice)
const readAllPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await ReportService.getAllReportsPaginated({
            page: Number(req.query.page),
            limit: Number(req.query.limit),
            sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
            status: req.query.status as ReportStatus,
            reason: req.query.reason as ReportReason,
            targetType: req.query.targetType as ReportTargetType,
            showDeleted: req.query.showDeleted === 'true',
            userRole: req.user?.role
        });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Actualizar reporte (ResoluciÃ³n/Notas de Admin)
const updateReport = async (req: Request<{ reportId: string }>, res: Response, next: NextFunction) => {
    const reportId = req.params.reportId;

    try {
        const report = await ReportService.updateReport(reportId, req.body);
        if (report) {
            res.status(200).json({ report });
        } else {
            res.status(404).json({ message: 'not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Soft Delete unitario
const softDeleteReport = async (req: Request<{ reportId: string }>, res: Response, next: NextFunction) => {
    const reportId = req.params.reportId;

    try {
        const report = await ReportService.softDeleteReport(reportId);
        if (report) {
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

        await ReportService.bulkSoftDeleteReports(ids);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Hard Delete unitario
const hardDeleteReport = async (req: Request<{ reportId: string }>, res: Response, next: NextFunction) => {
    const reportId = req.params.reportId;

    try {
        const report = await ReportService.hardDeleteReport(reportId);
        if (report) {
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

        await ReportService.bulkHardDeleteReports(ids);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export default {
    createReport,
    readReport,
    readAllPaginated,
    updateReport,
    softDeleteReport,
    bulkSoftDelete,
    hardDeleteReport,
    bulkHardDelete
};
