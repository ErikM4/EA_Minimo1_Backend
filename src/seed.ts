import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import User from './models/User';
import Activity from './models/Activity';
import Report from './models/Report';
import { SEED_USERS, getSeedActivities, getSeedReports } from './seed-data';

// Llena la base de datos con los datos de ejemplo de seed-data.ts.
//
//   npm run seed             inserta los datos solo si la base de datos está vacía
//   npm run seed -- --reset  borra todo (autores, libros, usuarios, actividades y reportes) y vuelve a insertarlos

const reset = process.argv.includes('--reset');

const seed = async () => {
    await mongoose.connect(config.mongo.url);
    Logging.info(`Conectado a ${config.mongo.url}`);

    if (reset) {
        // Borrado físico completo de todas las colecciones
        const usersDeleted = await User.deleteMany({});
        const activitiesDeleted = await Activity.deleteMany({});
        const reportsDeleted = await Report.deleteMany({});

        Logging.warning(`Borrados ${usersDeleted.deletedCount} usuarios, ${activitiesDeleted.deletedCount} actividades y ${reportsDeleted.deletedCount} reportes`);
    }

    const usersInDb = await User.countDocuments();
    const activitiesInDb = await Activity.countDocuments();
    const reportsInDb = await Report.countDocuments();

    // Verificación de integridad: si alguna colección clave ya tiene datos, abortamos salvo flag --reset
    if (usersInDb > 0 || activitiesInDb > 0 || reportsInDb > 0) {
        Logging.warning('La base de datos ya contiene datos. Para reinicializarla ejecuta: npm run seed -- --reset');
        return;
    }

    // 1. INSERCIÓN DE USUARIOS
    // Se insertan mediante bucle secuencial y User.create() para activar los hooks pre-save (hashing de contraseña con bcrypt)
    const createdUsers = [];
    for (const userData of SEED_USERS) {
        const user = await User.create(userData);
        createdUsers.push(user);
    }
    Logging.info(`Usuarios creados: ${createdUsers.length}`);

    // 2. INSERCIÓN DE ACTIVIDADES VINCULADAS
    const adminUser = createdUsers.find((u) => u.role === 'ADMIN');
    const storeUser = createdUsers.find((u) => u.role === 'STORE_HOST');
    const standardUser = createdUsers.find((u) => u.role === 'USER');

    if (!adminUser || !storeUser || !standardUser) {
        Logging.error('Faltan usuarios con roles requeridos (ADMIN, STORE_HOST, USER) en SEED_USERS para generar actividades y reportes.');
        return;
    }

    const activitiesData = getSeedActivities(adminUser._id.toString(), storeUser._id.toString(), standardUser._id.toString());

    const createdActivities = await Activity.insertMany(activitiesData);
    Logging.info(`Actividades creadas: ${createdActivities.length}`);

    // 3. INSERCIÓN DE REPORTES DE MODERACIÓN
    if (createdActivities.length > 0) {
        // Enlaza el reporte al usuario estándar como denunciante y a la primera actividad como objetivo
        const reportsData = getSeedReports(standardUser._id.toString(), createdActivities[0]._id.toString());

        const createdReports = await Report.insertMany(reportsData);
        Logging.info(`Reportes creados: ${createdReports.length}`);
    } else {
        Logging.warning('No se han creado reportes al no existir actividades disponibles para vincular.');
    }
};

seed()
    .catch((error) => {
        Logging.error(error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
