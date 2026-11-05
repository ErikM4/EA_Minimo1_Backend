import express from 'express';
import controller from '../controllers/Wishlist';
import { ValidateId, ValidateJoi, Schemas } from '../middleware/Joi';
import VerifyToken, { OptionalVerifyToken, RequireAdmin } from '../middleware/VerifyToken';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     WishlistItemInput:
 *       type: object
 *       required: [activityId]
 *       properties:
 *         activityId:
 *           type: string
 *           example: "654321098765432109876599"
 *         notes:
 *           type: string
 *           example: "Llevar zapatillas de pista"
 *         priority:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           default: 1
 *     WishlistInput:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           example: "Mis Actividades de Baloncesto Deseadas"
 *         description:
 *           type: string
 *           example: "Lista personal para guardar plaza en los próximos partidos"
 *         isPublic:
 *           type: boolean
 *           default: true
 *     WishlistUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Nombre actualizado de la wishlist"
 *         description:
 *           type: string
 *           example: "Nueva descripción detallada"
 *         isPublic:
 *           type: boolean
 *     WishlistItem:
 *       type: object
 *       properties:
 *         activityId:
 *           type: string
 *           example: "654321098765432109876599"
 *         notes:
 *           type: string
 *           example: "Llevar zapatillas de pista"
 *         priority:
 *           type: integer
 *         addedAt:
 *           type: string
 *           format: date-time
 *     Wishlist:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         authorId:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isPublic:
 *           type: boolean
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WishlistItem'
 *         deleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /wishlists:
 *   post:
 *     tags: [Wishlists]
 *     summary: Crea una nueva lista de deseos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WishlistInput'
 *     responses:
 *       201:
 *         description: Wishlist creada exitosamente
 *       400:
 *         description: Formato de objeto inválido
 *       401:
 *         description: Token ausente o inválido
 *       422:
 *         description: Error de validación de Joi
 */
router.post('/', VerifyToken, ValidateJoi(Schemas.wishlist.create), controller.createWishlist);

/**
 * @openapi
 * /wishlists:
 *   get:
 *     tags: [Wishlists]
 *     summary: Lista wishlists paginadas con filtros de servidor
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: createdAt }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: isPublic
 *         schema: { type: boolean }
 *       - in: query
 *         name: activityId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Listado paginado devuelto con éxito
 */
router.get('/', OptionalVerifyToken, controller.readAllPaginated);

/**
 * @openapi
 * /wishlists/{wishlistId}:
 *   get:
 *     tags: [Wishlists]
 *     summary: Obtiene el detalle de una wishlist por ID
 *     parameters:
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalle devuelto correctamente
 *       403:
 *         description: Acceso denegado a wishlist privada
 *       404:
 *         description: Wishlist no encontrada
 */
router.get('/:wishlistId', OptionalVerifyToken, ValidateId('wishlistId'), controller.readWishlist);

/**
 * @openapi
 * /wishlists/{wishlistId}:
 *   put:
 *     tags: [Wishlists]
 *     summary: Actualiza los datos de una wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WishlistUpdateInput'
 *     responses:
 *       200:
 *         description: Wishlist actualizada correctamente
 *       403:
 *         description: Solo el autor o admin pueden actualizar
 *       404:
 *         description: Wishlist no encontrada
 */
router.put('/:wishlistId', VerifyToken, ValidateId('wishlistId'), ValidateJoi(Schemas.wishlist.update), controller.updateWishlist);

/**
 * @openapi
 * /wishlists/{wishlistId}/items:
 *   post:
 *     tags: [Wishlists]
 *     summary: Añade una actividad a la wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WishlistItemInput'
 *     responses:
 *       200:
 *         description: Actividad añadida a la wishlist
 *       403:
 *         description: No autorizado
 *       409:
 *         description: La actividad ya está agregada en esta wishlist
 */
router.post('/:wishlistId/items', VerifyToken, ValidateId('wishlistId'), ValidateJoi(Schemas.wishlist.addItem), controller.addItem);

/**
 * @openapi
 * /wishlists/{wishlistId}/items/{activityId}:
 *   delete:
 *     tags: [Wishlists]
 *     summary: Elimina una actividad de la wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Actividad eliminada de la wishlist
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Wishlist o actividad no encontrada
 */
router.delete('/:wishlistId/items/:activityId', VerifyToken, ValidateId('wishlistId'), ValidateId('activityId'), controller.removeItem);

/**
 * @openapi
 * /wishlists/{wishlistId}/soft-delete:
 *   patch:
 *     tags: [Wishlists]
 *     summary: Borrado lógico de una wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Wishlist archivada lógicamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Wishlist no encontrada
 */
router.patch('/:wishlistId/soft-delete', VerifyToken, ValidateId('wishlistId'), controller.softDeleteWishlist);

/**
 * @openapi
 * /wishlists/{wishlistId}/restore:
 *   patch:
 *     tags: [Wishlists]
 *     summary: Restaura una wishlist archivada (Solo Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Wishlist restaurada exitosamente
 *       403:
 *         description: Requiere rol ADMIN
 */
router.patch('/:wishlistId/restore', VerifyToken, RequireAdmin, ValidateId('wishlistId'), controller.restoreWishlist);

/**
 * @openapi
 * /wishlists/{wishlistId}:
 *   delete:
 *     tags: [Wishlists]
 *     summary: Borrado físico definitivo de una wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Wishlist eliminada de la base de datos
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Wishlist no encontrada
 */
router.delete('/:wishlistId', VerifyToken, ValidateId('wishlistId'), controller.hardDeleteWishlist);

export default router;
