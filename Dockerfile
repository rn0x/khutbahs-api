# استخدام صورة Node.js الرسمية كقاعدة
FROM node:18-alpine

# تعيين مجلد العمل في الحاوية
WORKDIR /usr/src/app

# نسخ ملفات package.json و package-lock.json إلى مجلد العمل
COPY package*.json ./

# تثبيت الحزم
RUN npm install --only=production

# نسخ بقية ملفات المشروع إلى مجلد العمل
COPY . .

# تحديد المنفذ الذي سيعمل عليه التطبيق
EXPOSE 3000

# تعيين الأوامر اللازمة لتشغيل التطبيق
CMD ["npm", "start"]
