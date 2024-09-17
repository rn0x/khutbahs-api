import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import khutbahRoutes from './routes/khutbahRoutes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// Disable the X-Powered-By header
app.disable('x-powered-by');
// تفعيل CORS
app.use(cors());


// إعداد Middleware للتعامل مع JSON
app.use(express.json());

app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/database', express.static(path.join(__dirname, '..', 'database')));

// مسارات الخطبات
app.use('/api/khutbahs', khutbahRoutes);

// التعامل مع الأخطاء إذا لم يتم إيجاد المسار
app.use((req, res, next) => {
    const errorDetails = {
        timestamp: new Date().toISOString(), // Current date and time
        method: req.method,                // HTTP method (GET, POST, etc.)
        url: req.originalUrl,              // Requested URL
        status: 404,                       // HTTP status code
        error: 'Not Found'                 // Error message
    };

    console.error('Error Details:', errorDetails); // Log the error details to the console

    res.status(404).json({
        error: 'Not Found',
        details: errorDetails // Include error details in the response
    });
});


// بدء تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log();
    console.log('📂 Available API Endpoints:');
    console.log('  - /api/khutbahs          📝 Get a list of khutbahs with pagination');
    console.log('  - /api/khutbahs/:slug    📄 Get detailed information about a specific khutbah');
    console.log('  - /api/khutbahs/:slug/attachments  📎 Get attachments related to a specific khutbah');
    console.log();
    console.log('🌟 For more details on the API, check out the documentation in the README file.');
});

export default app;