import khutbahService from '../services/khutbahService.mjs';

// جلب كل الخطبات مع دعم التقسيم إلى صفحات
export const getAllKhutbahs = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const khutbahs = khutbahService.getAllKhutbahs(page, limit);
    res.json(khutbahs);
};

// جلب خطبة واحدة بالتفصيل بناءً على slug
export const getKhutbahBySlug = (req, res) => {
    const { slug } = req.params;

    try {
        const khutbah = khutbahService.getKhutbahBySlug(slug);

        if (!khutbah) {
            const Details = {
                timestamp: new Date().toISOString(),
                method: req.method,
                url: req.originalUrl,
                status: 404,
                error: 'Khutbah not found'
            };
            return res.status(404).json(Details);
        }

        res.json(khutbah);
    } catch (error) {
        console.error('Error fetching khutbah:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};


// جلب المرفقات لخطبة معينة
export const getKhutbahAttachments = (req, res) => {
    const { slug } = req.params;

    try {
        const attachments = khutbahService.getKhutbahAttachments(slug);

        if (!attachments) {
            const Details = {
                timestamp: new Date().toISOString(),
                method: req.method,
                url: req.originalUrl,
                status: 404,
                error: 'Attachments not found'
            };
            return res.status(404).json(Details);
        }

        res.json(attachments);
    } catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
