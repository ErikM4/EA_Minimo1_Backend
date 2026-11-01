import { IUser } from './models/User';
import { IActivity } from './models/Activity';
import { IReport } from './models/Report';

// ============================================================================
// 1. USUARIOS (PROYECTO FINAL)
// Roles: ADMIN, STORE_HOST, USER
// Contraseña por defecto: "sprint1" (hasheada por el hook pre-save de User)
// ============================================================================
export const SEED_USERS: Partial<IUser>[] = [
    {
        name: 'Admin General',
        email: 'admin@app.com',
        password: 'sprint1',
        role: 'ADMIN',
        bio: 'Administrador principal del Backoffice'
    },
    {
        name: 'Goblin Games Store',
        email: 'tienda@goblingames.com',
        password: 'sprint1',
        role: 'STORE_HOST',
        bio: 'Tienda especializada en TCG y juegos de mesa'
    },
    {
        name: 'Marc R.',
        email: 'marc@usuario.com',
        password: 'sprint1',
        role: 'USER',
        bio: 'Aficionado al baloncesto y running'
    },
    {
        name: 'Laura S.',
        email: 'laura@usuario.com',
        password: 'sprint1',
        role: 'USER',
        bio: 'Jugadora de cartas coleccionables'
    }
];

// ============================================================================
// 2. ACTIVIDADES (PROYECTO FINAL)
// Coordenadas GeoJSON Point [Longitud, Latitud] y LineString para rutas
// ============================================================================
export const getSeedActivities = (adminId: string, storeId: string, userId: string): Partial<IActivity>[] => [
    {
        creatorId: userId,
        title: 'Pachanga 3v3 Baloncesto UPC',
        description: 'Buscamos 2 personas más para completar partido casual de basket en las pistas exteriores.',
        category: 'SPORT',
        subcategory: 'BASKETBALL',
        modality: 'CASUAL',
        status: 'OPEN',
        location: {
            type: 'Point',
            coordinates: [2.0003, 41.2755],
            addressName: 'Pistas Campus PMT UPC, Castelldefels',
            isStoreLocation: false
        },
        schedule: {
            startTime: new Date(Date.now() + 86400000), // En 24h
            endTime: new Date(Date.now() + 93600000)
        },
        capacity: {
            minParticipants: 4,
            maxParticipants: 6
        },
        pricing: {
            price: 0
        },
        participants: [
            {
                userId: userId,
                name: 'Marc R.',
                joinedAt: new Date()
            }
        ]
    },
    {
        creatorId: storeId,
        title: 'Torneo Local One Piece TCG',
        description: 'Torneo semanal en tienda física. Construido a 50 cartas. Premios para el TOP 4.',
        category: 'LEISURE',
        subcategory: 'TCG_BOARDGAMES',
        modality: 'ORGANIZED',
        status: 'OPEN',
        location: {
            type: 'Point',
            coordinates: [2.17, 41.387],
            addressName: 'Carrer Major 15, Goblin Games',
            isStoreLocation: true
        },
        schedule: {
            startTime: new Date(Date.now() + 172800000), // En 48h
            endTime: new Date(Date.now() + 187200000)
        },
        capacity: {
            minParticipants: 8,
            maxParticipants: 16
        },
        pricing: {
            price: 5.0,
            prizeInfo: 'Sobres de expansión para los mejores clasificados'
        },
        participants: []
    },
    {
        creatorId: userId,
        title: 'Entrenamiento Running 5K Paseo Marítimo',
        description: 'Salida suave a ritmo de 5:30 min/km por el paseo marítimo.',
        category: 'SPORT',
        subcategory: 'RUNNING',
        modality: 'CASUAL',
        status: 'OPEN',
        location: {
            type: 'Point',
            coordinates: [1.98, 41.265],
            addressName: 'Monumento Rosa dels Vents',
            isStoreLocation: false
        },
        route: {
            distanceKm: 5.2,
            paceTarget: '5:30 min/km',
            path: {
                type: 'LineString',
                coordinates: [
                    [1.98, 41.265],
                    [1.985, 41.267],
                    [1.99, 41.269]
                ]
            }
        },
        schedule: {
            startTime: new Date(Date.now() + 259200000), // En 72h
            endTime: new Date(Date.now() + 262800000)
        },
        capacity: {
            minParticipants: 2,
            maxParticipants: 10
        },
        pricing: {
            price: 0
        },
        participants: []
    }
];

// ============================================================================
// 3. REPORTES DE MODERACIÓN (PROYECTO FINAL)
// Vinculados a los IDs generados dinámicamente en el seed
// ============================================================================
export const getSeedReports = (reporterId: string, activityId: string): Partial<IReport>[] => [
    {
        reporterId: reporterId,
        targetType: 'ACTIVITY',
        targetId: activityId,
        reason: 'SPAM',
        description: 'Evento publicado de forma duplicada varias veces en el mismo día.',
        status: 'PENDING'
    },
    {
        reporterId: reporterId,
        targetType: 'USER',
        targetId: reporterId,
        reason: 'INAPPROPRIATE',
        description: 'Comportamiento inadecuado en el chat del grupo.',
        status: 'REVIEWED',
        adminNotes: 'En revisión por el equipo de soporte.'
    }
];
