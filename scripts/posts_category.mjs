import fetch from 'node-fetch';
import fs from 'fs-extra';
import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';
dotenv.config(); 


const cookie = process.env.COOKIE;

// تحديد نطاق الفئات والصفحات
const startCategory = 3871;
const endCategory = 3995;
const startPage = 1;

// مسار الملف الذي سيتم تخزين البيانات فيه
const filePath = 'database/khutbahs_main_data.json';

// مصفوفة لتخزين البيانات المجمعة مؤقتاً
const allData = [];

// وظيفة لحفظ البيانات في الملف
async function saveDataToFile(data) {
    try {
        await fs.writeJson(filePath, data, { spaces: 2 });
        console.log(`Data saved to ${filePath}`);
    } catch (error) {
        console.error(`Failed to save data: ${error.message}`);
    }
}

// وظيفة لجلب البيانات
async function fetchData(category, page) {
    try {
        const response = await fetch(`https://khutabaa.com/ar/posts_category/${category}?page=${page}`, {
            headers: {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "ar;q=0.8",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Brave\";v=\"128\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "sec-gpc": "1",
                "x-requested-with": "XMLHttpRequest",
                "cookie": cookie,
                "Referer": "https://khutabaa.com/ar/categories",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            method: "GET"
        });

        if (response.ok) {
            const json = await response.json();
            return json.response;
        } else {
            console.error(`Error fetching data for category ${category} page ${page}: ${response.statusText}`);
            return null;
        }
    } catch (error) {
        console.error(`Request failed: ${error.message}`);
        return null;
    }
}

// وظيفة لجلب HTML
async function fetchHtml(category, page) {
    try {
        const response = await fetch(`https://khutabaa.com/ar/posts_category/${category}?page=${page}`, {
            headers: {
                "cookie": cookie,
            },
            method: "GET"
        });

        if (response.ok) {
            const text = await response.text();
            return text;
        } else {
            console.error(`Error fetching HTML for category ${category} page ${page}: ${response.statusText}`);
            return null;
        }
    } catch (error) {
        console.error(`Request failed: ${error.message}`);
        return null;
    }
}

// وظيفة لاستخراج عنوان الفئة من HTML
async function extractCategoryTitle(html) {
    try {
        const dom = new JSDOM(html);
        const document = dom.window.document;
        // العثور على العنصر الذي يحتوي على عنوان الفئة
        const categoryTitleElement = document.querySelector('#book-articles-tab');
        if (categoryTitleElement) {
            return categoryTitleElement.textContent.trim();
        } else {
            console.error('Element with id "book-articles-tab" not found');
            return null;
        }
    } catch (error) {
        console.error(`Error extracting category title: ${error.message}`);
        return null;
    }
}

// وظيفة لمعالجة البيانات وحفظها بشكل دوري
async function processAndSaveData(category, page) {
    const data = await fetchData(category, page);
    const html = await fetchHtml(category, page);

    if (!data || !html) return false;

    if (data.data.length > 0) {
        const filteredData = await Promise.all(
            data.data
                .filter(item => item.views && item.print && item.downloads && item.search === 0 && item.rate === null)
                .map(async item => ({
                    ...item,
                    url: `https://khutabaa.com/ar/article/${item.slug}`,
                    category_text: await extractCategoryTitle(html),
                    category: category,
                    page: page
                }))
        );

        // تحقق من عدم وجود بيانات مكررة قبل الإضافة
        for (const item of filteredData) {
            const index = allData.findIndex(existingItem => existingItem.url === item.url);
            if (index === -1) {
                allData.push(item);
            }
        }

        // حفظ البيانات في الملف بعد إضافتها
        await saveDataToFile(allData);

        return data.next_page_url;
    } else {
        return null;
    }
}

// وظيفة رئيسية لتشغيل العملية
async function main() {
    for (let category = startCategory; category <= endCategory; category++) {
        let currentPage = startPage;

        console.log(`Processing category ${category}...`);

        while (true) {
            const nextPageUrl = await processAndSaveData(category, currentPage);

            if (!nextPageUrl) {
                console.log(`No more pages for category ${category} page ${currentPage}. Moving to the next category.`);
                break;
            }

            currentPage++;
            console.log(`Processed page ${currentPage} for category ${category}.`);
        }
    }

    console.log('Processing complete.');
}

main().catch(error => console.error(`Main function failed: ${error.message}`));