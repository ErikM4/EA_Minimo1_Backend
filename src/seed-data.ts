import { IAuthor } from './models/Author';
import { IBook } from './models/Book';
import { IUser } from './models/User';
import { IActivity } from './models/Activity';

// Datos de ejemplo para llenar la base de datos.
// Los correos, las webs, los ISBN y los precios son inventados.
// Las contraseñas están sin cifrar: cifrarlas es la tarea del hook pre-save (ver CONTRIBUTING).
// Contraseña por defecto para todas las cuentas de prueba: "sprint1" (se cifrará con el hook pre-save)
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

// Función auxiliar para construir el array de actividades tras crear los usuarios
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
            coordinates: [2.0003, 41.2755], // [Longitud, Latitud]
            addressName: 'Pistas Campus PMT UPC, Castelldefels',
            isStoreLocation: false
        },
        schedule: {
            startTime: new Date(Date.now() + 86400000), // Mañana
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
            startTime: new Date(Date.now() + 172800000), // En 2 días
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
            startTime: new Date(Date.now() + 259200000),
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

export const authorsSeed: IAuthor[] = [
    {
        name: 'Miguel de Cervantes',
        email: 'cervantes@example.com',
        password: 'seminari5',
        birthDate: new Date('1547-09-29'),
        nationality: 'España',
        biography: 'Autor de El Quijote, la novela más conocida de la literatura española.',
        website: 'https://example.com/cervantes',
        photoUrl: 'https://example.com/fotos/cervantes.jpg',
        role: 'author',
        deleted: false
    }
];

// Cada libro dice de qué autores es con sus emails. El script del seed los cambia
// por los ids que MongoDB les ha dado.
// El campo 'deleted' tampoco se indica aquí: el esquema del libro lo pone en false por defecto.
export type BookSeed = Omit<IBook, 'authors' | 'deleted'> & { authorEmails: string[] };

export const booksSeed: BookSeed[] = [
    {
        title: 'Don Quijote de la Mancha',
        authorEmails: ['cervantes@example.com'],
        isbn: '9788400000001',
        edition: 3,
        publisher: 'Editorial Ejemplo',
        publishedYear: 1605,
        pages: 863,
        language: 'es',
        tags: ['novela'],
        price: 19.9,
        description: [
            'En un lugar de la Mancha vive Alonso Quijano, un hidalgo apasionado por las novelas de caballerías hasta el punto de perder el juicio y creerse él mismo un caballero andante. Rebautizado como don Quijote de la Mancha y a lomos de su caballo Rocinante, decide lanzarse a los caminos en busca de aventuras, honra y justicia para consagrar sus hazañas a su amada Dulcinea del Toboso.',
            'Acompañado por el ingenuo pero pragmático campesino Sancho Panza, convertido en su fiel escudero, la pareja protagoniza una sucesión de desventuras cómicas y conmovedoras, transformando ventas en castillos, molinos de viento en gigantes amenazantes y rebaños de ovejas en ejércitos formidables.',
            'Obra cumbre de la literatura española y precursora indiscutible de la novela moderna, Cervantes teje una reflexión magistral sobre el choque entre los ideales heroicos y la cruda realidad del mundo cotidiano.'
        ].join('\n\n')
    }
];
