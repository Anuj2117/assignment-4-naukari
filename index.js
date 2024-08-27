import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';

async function scrapeData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.naukri.com/it-jobs?src=gnbjobs_homepage_srch", { waitUntil: 'networkidle2' });

    const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll('.jobTuple');
        const jobData = [];
        jobElements.forEach(element => {
            const title = element.querySelector('.title')?.innerText.trim() || 'N/A';
            const company = element.querySelector('.companyName')?.innerText.trim() || 'N/A';
            const location = element.querySelector('.location')?.innerText.trim() || 'N/A';
            const jobType = element.querySelector('.jobType')?.innerText.trim() || 'N/A';
            const postedDate = element.querySelector('.postedDate')?.innerText.trim() || 'N/A';
            const description = element.querySelector('.description')?.innerText.trim() || 'N/A';

            jobData.push({ title, company, location, jobType, postedDate, description });
        });
        return jobData;
    });

    await browser.close();
    return jobs;
}

async function saveToExcel(jobs) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Jobs");

    worksheet.columns = [
        { header: 'Job Title', key: 'title', width: 30 },
        { header: 'Company Name', key: 'company', width: 30 },
        { header: 'Location', key: 'location', width: 20 },
        { header: 'Job Type', key: 'jobType', width: 15 },
        { header: 'Posted Date', key: 'postedDate', width: 15 },
        { header: 'Job Description', key: 'description', width: 50 }
    ];

    jobs.forEach(job => {
        worksheet.addRow(job);
    });

    await workbook.xlsx.writeFile("jobs.xlsx");
    console.log('Data successfully saved to jobs.xlsx');
}

async function main() {
    try {
        const jobs = await scrapeData();
        if (jobs.length === 0) {
            console.log('No jobs data found.');
        } else {
            await saveToExcel(jobs);
        }
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main();
