import fs from 'fs';
import path from 'path';
import mainData from '../../database/khutbahs_main_data.json' assert { type: 'json' };
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسار مجلد التفاصيل
const detailsDirectory = path.join(__dirname, '../../database/khutbahs_details');

// جلب جميع الخطبات مع دعم التقسيم إلى صفحات
const getAllKhutbahs = (page = 1, limit = 20) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // استخدام slice لتحديد العناصر التي نحتاجها بناءً على الصفحة والحد (limit)
    const khutbahsPage = mainData.slice(startIndex, endIndex);

    const updatedKhutbahsPage = khutbahsPage.map(khutbah => {
        const slug = khutbah.slug;
        return {
            ...khutbah,
            url: `/api/${slug}`
        };
    });

    return {
        khutbahs: updatedKhutbahsPage,
        totalItems: mainData.length,
        currentPage: page,
        totalPages: Math.ceil(mainData.length / limit),
        itemsPerPage: limit,
    };
};

// جلب تفاصيل خطبة بناءً على slug
const getKhutbahBySlug = (slug) => {
    const khutbahPath = path.join(detailsDirectory, `${slug}.json`);

    if (fs.existsSync(khutbahPath)) {
        const khutbahData = fs.readFileSync(khutbahPath, 'utf8');
        return JSON.parse(khutbahData);
    }

    return null;
};

// جلب المرفقات لخطبة معينة بناءً على slug
const getKhutbahAttachments = (slug) => {
    const khutbah = getKhutbahBySlug(slug);
    if (khutbah) {
        return khutbah.attachments || [];
    }
    return null;
};

export default {
    getAllKhutbahs,
    getKhutbahBySlug,
    getKhutbahAttachments,
};
