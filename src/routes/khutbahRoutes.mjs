import express from 'express';
import { getAllKhutbahs, getKhutbahBySlug, getKhutbahAttachments } from '../controllers/khutbahController.mjs';

const router = express.Router();

// جلب كل الخطبات
router.get('/', getAllKhutbahs);

// جلب تفاصيل خطبة واحدة بناءً على slug
router.get('/:slug', getKhutbahBySlug);

// جلب المرفقات لخطبة معينة
router.get('/:slug/attachments', getKhutbahAttachments);

export default router;
