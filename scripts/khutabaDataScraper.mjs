import fetch from 'node-fetch';
import fs from 'fs-extra';
import { JSDOM } from 'jsdom';
import path from 'path'
import dotenv from 'dotenv';
dotenv.config(); 


const cookie = process.env.COOKIE;

// وظيفة لجلب البيانات
async function fetchHtml(link) {
    try {
        const response = await fetch(link, {
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
            const text = await response.text();
            console.log(`Successfully fetched data for ${link}`);
            return text;
        } else {
            console.error(`Error fetching data for link ${link}: ${response.statusText}`);
            return null;
        }
    } catch (error) {
        console.error(`Request failed: ${error.message}`);
        return null;
    }
}


const posts_category = fs.readJSONSync("./database/khutbahs_main_data.json");

for (const [index, element] of posts_category.entries()) {

    try {
        console.log(`Processing item ${index + 1}/${posts_category.length}: ${element.title}`);
        const html = await fetchHtml(element.url);
        const dom = new JSDOM(html);
        const document = dom.window.document;
        // استخراج محتوى المقالة من العنصر #article-content
        const rawContent = document.querySelector("#article-content").textContent.trim();
        const htmlContent = document.querySelector("#article-content").innerHTML.trim();
        console.log(`Extracted content for ${element.title}`);
        const attachments = document.querySelectorAll(".attached-files-div .mb-1");

        const filesData = [];

        attachments.forEach(async attachment => {
            // استخراج اسم الملف من عنصر <p>
            const fileName = attachment.querySelector('p').textContent.trim();

            // استخراج رابط التحميل من عنصر <a>
            const downloadLink = attachment.querySelector('a').href;

            const sanitizedFileName = fileName.split(" ").join("_").trim();

            // التحقق مما إذا كان اسم الملف يحتوي على امتداد صحيح
            const extensionPattern = /\.(pdf|doc|docx)$/i;
            const hasValidExtension = extensionPattern.test(sanitizedFileName);

            let finalFileName;
            if (hasValidExtension) {
                finalFileName = sanitizedFileName;
            } else {
                finalFileName = `${sanitizedFileName}.doc`;
            }

            // تخزين البيانات في مصفوفة
            filesData.push({
                name: finalFileName,
                path: `/database/files/${finalFileName}`,
                link: downloadLink
            });

            console.log(`Downloading attachment: ${fileName}`);
            await downloadFile(downloadLink, `./database/files/${finalFileName}`)

        });

        // استخراج التصنيفات الرئيسية
        const mainCategories = Array.from(document.querySelectorAll('.category-label'))
            .filter(category => category.closest('div').previousElementSibling === null)
            .map(category => ({
                name: category.textContent.trim(),
                link: category.href
            }));

        // استخراج التصنيفات الفرعية
        const subCategories = Array.from(document.querySelectorAll('.category-label'))
            .filter(category => category.closest('div').previousElementSibling !== null)
            .map(category => ({
                name: category.textContent.trim(),
                link: category.href
            }));

        console.log(`Extracted categories for ${element.title}`);

        const khutabaData = {
            id: element.id,
            title: element.title,
            slug: element.slug,
            author: element.author,
            rawContent, // Raw text content
            htmlContent, // HTML formatted content
            attachments: filesData,
            mainCategories,
            subCategories,
            url: element.url,
        };


        await fs.writeJson(`./database/khutbahs_details/${element.slug}.json`, khutabaData, { spaces: 2 });
        console.log(`Data saved for ${element.title}`);

    } catch (error) {
        console.error(`Error processing item ${index + 1}: ${error.message}`);

    }
}


async function downloadFile(url, filePath) {
    try {
        // Ensure the directory exists
        await fs.ensureDir(path.dirname(filePath));

        // Fetch the file from the URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }

        // Create a writable stream to save the file
        const fileStream = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
            response.body.pipe(fileStream);
            response.body.on('error', reject);
            fileStream.on('finish', resolve);
        });

        console.log(`Downloaded and saved file to ${filePath}`);
    } catch (error) {
        console.error(`Error downloading file: ${error.message}`);
    }
}