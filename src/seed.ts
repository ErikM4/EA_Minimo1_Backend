import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import Author from './models/Author';
import Book from './models/Book';
import User from './models/User';
import Activity from './models/Activity';
import { authorsSeed, booksSeed, SEED_USERS, getSeedActivities } from './seed-data';

// Llena la base de datos con los datos de ejemplo de seed-data.ts.
//
//   npm run seed             inserta los datos solo si la base de datos está vacía
//   npm run seed -- --reset  borra todo (autores, libros, usuarios y actividades) y vuelve a insertarlos

const reset = process.argv.includes('--reset');

const seed = async () => {
    await mongoose.connect(config.mongo.url);
    Logging.info(`Conectado a ${config.mongo.url}`);

    if (reset) {
        // Borrado físico completo de las colecciones antiguas y nuevas
        const authorsDeleted = await Author.deleteMany({});
        const booksDeleted = await Book.deleteMany({});
        const usersDeleted = await User.deleteMany({});
        const activitiesDeleted = await Activity.deleteMany({});

        Logging.warning(`Borrados ${authorsDeleted.deletedCount} autores, ${booksDeleted.deletedCount} libros, ${usersDeleted.deletedCount} usuarios y ${activitiesDeleted.deletedCount} actividades`);
    }

    const usersInDb = await User.countDocuments();
    const authorsInDb = await Author.countDocuments();

    if (usersInDb > 0 || authorsInDb > 0) {
        Logging.warning('La base de datos ya tiene datos. Para rehacerla: npm run seed -- --reset');
        return;
    }

    // 1. INSERCIÓN DE AUTORES Y LIBROS (REFERENCIA DE LA PLANTILLA)
    const createdAuthors = await Author.create(authorsSeed);
    Logging.info(`Autores creados: ${createdAuthors.length}`);

    const booksWithAuthors = booksSeed.map(({ authorEmails, ...book }) => {
        const authors = authorEmails.map((email) => {
            const author = createdAuthors.find((created) => created.email === email);
            if (!author) {
                throw new Error(`En seed-data.ts hay un libro de un autor que no existe: ${email}`);
            }
            return author._id;
        });
        return { ...book, authors };
    });

    const createdBooks = await Book.insertMany(booksWithAuthors);
    Logging.info(`Libros creados: ${createdBooks.length}`);

    // 2. INSERCIÓN DE USUARIOS Y ACTIVIDADES (PROYECTO FINAL)
    const createdUsers = [];
    for (const userData of SEED_USERS) {
        // Usamos User.create() para que se ejecute el middleware pre-save de bcrypt con "sprint1"
        const user = await User.create(userData);
        createdUsers.push(user);
    }
    Logging.info(`Usuarios creados: ${createdUsers.length}`);

    const adminUser = createdUsers.find((u) => u.role === 'ADMIN');
    const storeUser = createdUsers.find((u) => u.role === 'STORE_HOST');
    const standardUser = createdUsers.find((u) => u.role === 'USER');

    if (adminUser && storeUser && standardUser) {
        const activitiesData = getSeedActivities(adminUser._id.toString(), storeUser._id.toString(), standardUser._id.toString());

        const createdActivities = await Activity.insertMany(activitiesData);
        Logging.info(`Actividades creadas: ${createdActivities.length}`);
    } else {
        Logging.error('Faltan usuarios con roles ADMIN, STORE_HOST o USER en SEED_USERS.');
    }
};

seed()
    .catch((error) => {
        Logging.error(error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
