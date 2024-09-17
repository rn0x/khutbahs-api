# 📜 Khutbahs API

API لإدارة واستعراض الخطب الإسلامية من قاعدة بيانات تشمل بيانات الخطب والمرفقات المرتبطة بها.

![repository-open-graph-template](https://github.com/user-attachments/assets/a74efcdd-9a36-40e7-9b8d-53088d515fc2)


## 📂 هيكل المشروع

```bash
.
├── database                   # مجلد يحتوي على قاعدة البيانات
│   ├── files                  # المرفقات مثل ملفات الـ PDF و DOC
│   │   ├── (إِنَّكَ_كَادِحٌ_إِلَى_رَبِّكَ_كَدْحًا_فَمُلَاقِيهِ).doc
│   │   ├── (إِنَّكَ_كَادِحٌ_إِلَى_رَبِّكَ_كَدْحًا_فَمُلَاقِيهِ).pdf
│   │   └── ...                # ملفات أخرى
│   ├── khutbahs_details       # ملفات JSON لكل خطبة
│   │   ├── ابتلاء-الأنبياء-وأتباعهم-.json
│   │   └── ...                # ملفات خطب أخرى
│   └── khutbahs_main_data.json # ملف JSON الرئيسي الذي يحتوي على البيانات الأساسية لكل خطبة
├── scripts                    # سكربتات لجلب وتنظيف البيانات
│   ├── cleanJsonFile.mjs      # سكربت لتنظيف بيانات JSON
│   ├── khutabaDataScraper.mjs # سكربت لجلب بيانات الخطب
│   └── posts_category.mjs     # سكربت لجلب بيانات الفئات
├── src                        # ملفات المشروع الرئيسية
│   ├── public                 # الملفات الثابتة 
│   ├── controllers            # ملفات التحكم (Controllers)
│   ├── routes                 # ملفات المسارات (Routes)
│   ├── services               # الخدمات والعمليات الرئيسية (Services)
│   └── index.mjs              # ملف تشغيل التطبيق الرئيسي
├── .env                       # ملف البيئة (Environment Variables)
└── package.json               # ملف تهيئة المشروع
```

## 🚀 تشغيل المشروع

لتشغيل المشروع محليًا، اتبع الخطوات التالية:

1. قم باستنساخ المشروع:

    ```bash
    git clone https://github.com/rn0x/khutbahs-api.git
    ```

2. ثبّت الحزم المطلوبة:

    ```bash
    npm install
    ```

3. قم بتشغيل الخادم:

    ```bash
    npm start
    ```

الـ API سيعمل الآن على `http://localhost:3000`.

## 🚀 تشغيل المشروع باستخدام Docker

### 1. **بناء صورة Docker**

لبناء صورة Docker لمشروعك، استخدم الأمر التالي في مجلد المشروع حيث يتواجد `Dockerfile`:

```bash
docker build -t khutbahs-api .
```

- `khutbahs-api` هو اسم الصورة الذي سيتم إنشاؤه. يمكنك تغيير الاسم كما تريد.

### 2. **تشغيل الحاوية**

بعد بناء الصورة، قم بتشغيل الحاوية باستخدام الأمر:

```bash
docker run -d -p 3000:3000 --name khutbahs-container khutbahs-api
```

- `-d` لتشغيل الحاوية في وضع الخلفية.
- `-p 3000:3000` لتوجيه المنفذ 3000 من الحاوية إلى المنفذ 3000 على المضيف.
- `--name khutbahs-container` لتسمية الحاوية.
- `khutbahs-api` هو اسم الصورة التي تم إنشاؤها.

### 3. **التحقق من تشغيل التطبيق**

يمكنك التحقق من أن التطبيق يعمل بشكل صحيح من خلال زيارة:

[http://localhost:3000](http://localhost:3000)

### 4. **إيقاف الحاوية**

لإيقاف الحاوية، استخدم الأمر:

```bash
docker stop khutbahs-container
```

### 5. **حذف الحاوية**

لحذف الحاوية بعد إيقافها، استخدم الأمر:

```bash
docker rm khutbahs-container
```

## 📖 API التوثيق

### 🗂️ جلب كل الخطب (مع دعم الـ Pagination)

**الوصف:** جلب بيانات الخطب الرئيسية مع دعم التقسيم إلى صفحات.

- **الطلب:** `GET /api`
- **المعلمات:**
  - `page` (اختياري): رقم الصفحة (افتراضيًا 1)
  - `limit` (اختياري): عدد العناصر لكل صفحة (افتراضيًا 20)
  
- **الاستجابة:**
  ```json
  {
    "khutbahs": [ ... ],
    "totalItems": 4531,
    "currentPage": 1,
    "totalPages": 227,
    "itemsPerPage": 20
  }
  ```

### 📄 جلب تفاصيل خطبة معينة

**الوصف:** جلب التفاصيل الكاملة لخطبة معينة باستخدام الـ `slug`.

- **الطلب:** `GET /api/:slug`
- **المعلمات:**
  - `slug`: معرف الخطبة الفريد في الـ URL

- **الاستجابة:**
  ```json
  {
    "id": 2147,
    "title": "الجنة دار الكرامة",
    "slug": "الجنة-دار-الكرامة",
    "author": {
      "name_prefix": "الشيخ",
      "first_name": "عبدالعزيز",
      "last_name": "بن محمد النغيمشي"
    },
    "rawContent": "عناصر الخطبة\n...",
    "htmlContent": "<div>...</div>",
    "attachments": [ ... ],
    "mainCategories": [ ... ],
    "subCategories": [ ... ],
    "url": "https://khutabaa.com/ar/article/الجنة-دار-الكرامة"
  }
  ```

### 📎 جلب مرفقات خطبة معينة

**الوصف:** جلب جميع المرفقات (مثل ملفات الـ PDF و DOC) المرتبطة بخطبة معينة.

- **الطلب:** `GET /api/:slug/attachments`
- **المعلمات:**
  - `slug`: معرف الخطبة الفريد في الـ URL

- **الاستجابة:**
  ```json
  [
    {
      "name": "الجنة_دار_الكرامة.doc",
      "path": "/database/files/الجنة_دار_الكرامة.doc",
      "link": "https://khutabaa.com/article/.../download-file/380956"
    },
    {
      "name": "الجنة_دار_الكرامة.pdf",
      "path": "/database/files/الجنة_دار_الكرامة.pdf",
      "link": "https://khutabaa.com/article/.../download-file/380957"
    }
  ]
  ```

## 📝 ملاحظات

- استخدم `Postman` أو أي أداة أخرى لاختبار الـ API.
- يمكنك تخصيص عدد العناصر في كل صفحة عبر تمرير معلمة `limit` في طلب الجلب.

---

✨ **تم بناء هذا المشروع باستخدام:**

- Node.js
- Express.js
- File System (FS) لإدارة الملفات


## 🌐 مصدر البيانات
تم بناء المكشطة (scraper) الخاصة بالمشروع لجلب البيانات من موقع [ملتقى الخطباء](https://khutabaa.com/)، وهو موقع يحتوي على مجموعة واسعة من الخطب الإسلامية. تتضمن البيانات التي يتم جمعها تفاصيل الخطبة، المرفقات مثل ملفات PDF و DOC، والتصنيفات المتعلقة بكل خطبة.


## 📝 الترخيص

يتم ترخيص هذا المشروع تحت **ترخيص MIT**. يمكنك استخدام الكود وتعديله وتوزيعه وفقًا لشروط الترخيص.
