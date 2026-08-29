require("dotenv").config();

const express = require("express");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

// =====================================================
// GITHUB CONFIGURATION
// =====================================================

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const GITHUB_REPO =
    "suryasai693-lang/daily_sales";

const GITHUB_FILE_PATH =
    "data/sales.xlsx";

const GITHUB_BRANCH =
    "main";


// =====================================================
// EXPRESS APP
// =====================================================

const app = express();

app.use(express.json());

app.use(express.static("public"));


// =====================================================
// LOCAL EXCEL FILE PATH
// =====================================================

const filePath =
    path.join(
        __dirname,
        "data",
        "sales.xlsx"
    );


async function ensureLocalExcelFile() {

    if (fs.existsSync(filePath)) {

        return;

    }

    const workbook =
        new ExcelJS.Workbook();

    workbook.addWorksheet("SALES");
    workbook.addWorksheet("ITEM_MASTER");
    workbook.addWorksheet("SUPPLY");
    workbook.addWorksheet("MONTHLY_STOCK");
    workbook.addWorksheet("DAILY_SALES_REPORT");

    await workbook.xlsx.writeFile(filePath);

    console.log(
        "Local sales.xlsx file was created."
    );

}


// =====================================================
// DOWNLOAD SALES.XLSX FROM GITHUB
// =====================================================

async function downloadExcelFromGitHub() {

    await ensureLocalExcelFile();

    if (!GITHUB_TOKEN) {

        console.log(
            "GITHUB_TOKEN is not configured. Using local sales.xlsx."
        );

        return fs.readFileSync(filePath);

    }


    const url =
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;


    const response =
        await fetch(
            url,
            {

                headers: {

                    "Authorization":
                        `Bearer ${GITHUB_TOKEN}`,

                    "Accept":
                        "application/vnd.github+json",

                    "X-GitHub-Api-Version":
                        "2022-11-28"

                }

            }
        );


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `GitHub download failed: ${response.status} ${errorText}`
        );

    }


    const data =
        await response.json();


    if (!data.content) {

        throw new Error(
            "GitHub file content is empty."
        );

    }


    const fileBuffer =
        Buffer.from(
            data.content.replace(/\n/g, ""),
            "base64"
        );


    // Make sure local data folder exists

    const dataFolder =
        path.dirname(filePath);


    if (!fs.existsSync(dataFolder)) {

        fs.mkdirSync(
            dataFolder,
            {
                recursive: true
            }
        );

    }


    fs.writeFileSync(
        filePath,
        fileBuffer
    );


    console.log(
        "Latest sales.xlsx downloaded from GitHub."
    );


    return fileBuffer;

}


// =====================================================
// UPLOAD EXCEL BUFFER TO GITHUB
// =====================================================

async function uploadExcelToGitHub(
    fileBuffer
) {

    await ensureLocalExcelFile();

    if (!GITHUB_TOKEN) {

        fs.writeFileSync(
            filePath,
            Buffer.from(fileBuffer)
        );

        console.log(
            "GITHUB_TOKEN is not configured. Local sales.xlsx updated."
        );

        return;

    }


    if (!fileBuffer) {

        throw new Error(
            "Excel file buffer is empty."
        );

    }


    const content =
        fileBuffer.toString("base64");


    // =================================================
    // GET CURRENT FILE SHA
    // =================================================

    const getUrl =
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;


    const getResponse =
        await fetch(
            getUrl,
            {

                headers: {

                    "Authorization":
                        `Bearer ${GITHUB_TOKEN}`,

                    "Accept":
                        "application/vnd.github+json",

                    "X-GitHub-Api-Version":
                        "2022-11-28"

                }

            }
        );


    if (!getResponse.ok) {

        const errorText =
            await getResponse.text();

        throw new Error(
            `Unable to get GitHub file information: ${getResponse.status} ${errorText}`
        );

    }


    const fileData =
        await getResponse.json();


    // =================================================
    // UPDATE FILE
    // =================================================

    const updateUrl =
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;


    const updateResponse =
        await fetch(
            updateUrl,
            {

                method: "PUT",

                headers: {

                    "Authorization":
                        `Bearer ${GITHUB_TOKEN}`,

                    "Accept":
                        "application/vnd.github+json",

                    "Content-Type":
                        "application/json",

                    "X-GitHub-Api-Version":
                        "2022-11-28"

                },

                body:
                    JSON.stringify({

                        message:
                            "Update sales.xlsx from DailyStock",

                        content:
                            content,

                        sha:
                            fileData.sha,

                        branch:
                            GITHUB_BRANCH

                    })

            }
        );


    if (!updateResponse.ok) {

        const errorText =
            await updateResponse.text();

        throw new Error(
            `GitHub upload failed: ${updateResponse.status} ${errorText}`
        );

    }


    console.log(
        "sales.xlsx successfully updated in GitHub."
    );

}


// =====================================================
// HELPER FUNCTION
// =====================================================

function getText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    if (
        typeof value === "object" &&
        value.text !== undefined
    ) {

        return String(
            value.text
        ).trim();

    }


    return String(
        value
    ).trim();

}


// =====================================================
// EXCEL DATE -> YYYY-MM-DD
// =====================================================

function getDate(value) {

    if (!value) {

        return "";

    }


    // Excel Date object

    if (value instanceof Date) {

        const year =
            value.getFullYear();


        const month =
            String(
                value.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                value.getDate()
            ).padStart(
                2,
                "0"
            );


        return `${year}-${month}-${day}`;

    }


    return String(
        value
    ).substring(
        0,
        10
    );

}


// =====================================================
// PREVIOUS MONTH
// =====================================================

function getPreviousMonth(
    month
) {

    const date =
        new Date(
            `${month}-01T00:00:00`
        );


    date.setMonth(
        date.getMonth() - 1
    );


    const year =
        date.getFullYear();


    const monthNumber =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    return `${year}-${monthNumber}`;

}


// =====================================================
// GET ITEMS
// =====================================================

app.get(
    "/items",
    async (req, res) => {

        try {

            // Get latest Excel from GitHub

            await downloadExcelFromGitHub();


            const workbook =
                new ExcelJS.Workbook();


            await workbook.xlsx.readFile(
                filePath
            );


            const sheet =
                workbook.getWorksheet(
                    "ITEM_MASTER"
                );


            if (!sheet) {

                return res.status(500).json({

                    message:
                        "ITEM_MASTER sheet not found"

                });

            }


            const items = [];


            for (
                let rowNumber = 2;
                rowNumber <= sheet.rowCount;
                rowNumber++
            ) {

                const row =
                    sheet.getRow(
                        rowNumber
                    );


                const itemName =
                    getText(
                        row.getCell(1).value
                    );


                if (!itemName) {

                    continue;

                }


                const price =
                    Number(
                        row.getCell(2).value || 0
                    );


                const openingStock =
                    Number(
                        row.getCell(3).value || 0
                    );


                items.push({

                    name:
                        itemName,

                    price:
                        price,

                    openingStock:
                        openingStock

                });

            }


            res.json(
                items
            );

        }

        catch (error) {

            console.error(
                "ITEMS ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to read items"

            });

        }

    }
);


// =====================================================
// GET CURRENT STOCK
// =====================================================

app.get(
    "/current-stock",
    async (req, res) => {

        try {

            const itemName =
                req.query.item;


            const month =
                req.query.month;


            if (
                !itemName ||
                !month
            ) {

                return res.status(400).json({

                    message:
                        "Item and month are required"

                });

            }


            // Download latest Excel

            await downloadExcelFromGitHub();


            const workbook =
                new ExcelJS.Workbook();


            await workbook.xlsx.readFile(
                filePath
            );


            const itemSheet =
                workbook.getWorksheet(
                    "ITEM_MASTER"
                );


            const salesSheet =
                workbook.getWorksheet(
                    "SALES"
                );


            const supplySheet =
                workbook.getWorksheet(
                    "SUPPLY"
                );


            const stockSheet =
                workbook.getWorksheet(
                    "MONTHLY_STOCK"
                );


            // =================================================
            // FIND ITEM
            // =================================================

            let itemPrice = 0;

            let initialOpening = 0;


            if (itemSheet) {

                for (
                    let rowNumber = 2;
                    rowNumber <= itemSheet.rowCount;
                    rowNumber++
                ) {

                    const row =
                        itemSheet.getRow(
                            rowNumber
                        );


                    const name =
                        getText(
                            row.getCell(1).value
                        );


                    if (
                        name === itemName
                    ) {

                        itemPrice =
                            Number(
                                row.getCell(2).value || 0
                            );


                        initialOpening =
                            Number(
                                row.getCell(3).value || 0
                            );


                        break;

                    }

                }

            }


            // =================================================
            // PREVIOUS MONTH
            // =================================================

            const previousMonth =
                getPreviousMonth(
                    month
                );


            // =================================================
            // OPENING STOCK
            // =================================================

            let openingStock =
                initialOpening;


            if (stockSheet) {

                for (
                    let rowNumber = 2;
                    rowNumber <= stockSheet.rowCount;
                    rowNumber++
                ) {

                    const row =
                        stockSheet.getRow(
                            rowNumber
                        );


                    const rowMonth =
                        getText(
                            row.getCell(1).value
                        );


                    const rowItem =
                        getText(
                            row.getCell(2).value
                        );


                    if (
                        rowMonth === previousMonth &&
                        rowItem === itemName
                    ) {

                        openingStock =
                            Number(
                                row.getCell(12).value || 0
                            );

                    }

                }

            }


            // =================================================
            // CURRENT MONTH SUPPLY
            // =================================================

            let currentSupply = 0;


            if (supplySheet) {

                for (
                    let rowNumber = 2;
                    rowNumber <= supplySheet.rowCount;
                    rowNumber++
                ) {

                    const row =
                        supplySheet.getRow(
                            rowNumber
                        );


                    const rowMonth =
                        getText(
                            row.getCell(2).value
                        );


                    const rowItem =
                        getText(
                            row.getCell(3).value
                        );


                    if (
                        rowMonth === month &&
                        rowItem === itemName
                    ) {

                        currentSupply +=
                            Number(
                                row.getCell(4).value || 0
                            );

                    }

                }

            }


            // =================================================
            // CURRENT MONTH SALES
            // =================================================

            let currentSales = 0;


            if (salesSheet) {

                for (
                    let rowNumber = 2;
                    rowNumber <= salesSheet.rowCount;
                    rowNumber++
                ) {

                    const row =
                        salesSheet.getRow(
                            rowNumber
                        );


                    const rowDate =
                        getDate(
                            row.getCell(1).value
                        );


                    const rowItem =
                        getText(
                            row.getCell(3).value
                        );


                    if (
                        rowDate.startsWith(month) &&
                        rowItem === itemName
                    ) {

                        currentSales +=
                            Number(
                                row.getCell(5).value || 0
                            );

                    }

                }

            }


            // =================================================
            // CALCULATE
            // =================================================

            const availableStock =
                openingStock +
                currentSupply -
                currentSales;


            const availableValue =
                availableStock *
                itemPrice;


            res.json({

                item:
                    itemName,

                price:
                    itemPrice,

                openingStock:
                    openingStock,

                supply:
                    currentSupply,

                sales:
                    currentSales,

                stock:
                    availableStock,

                value:
                    availableValue

            });

        }

        catch (error) {

            console.error(
                "CURRENT STOCK ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to calculate current stock"

            });

        }

    }
);


// =====================================================
// REBUILD MONTHLY STOCK
// =====================================================

async function rebuildMonthlyStock(
    workbook,
    month
) {

    const itemSheet =
        workbook.getWorksheet(
            "ITEM_MASTER"
        );


    const salesSheet =
        workbook.getWorksheet(
            "SALES"
        );


    const supplySheet =
        workbook.getWorksheet(
            "SUPPLY"
        );


    let stockSheet =
        workbook.getWorksheet(
            "MONTHLY_STOCK"
        );


    if (!itemSheet) {

        throw new Error(
            "ITEM_MASTER sheet not found."
        );

    }


    // =================================================
    // CREATE MONTHLY STOCK SHEET
    // =================================================

    if (!stockSheet) {

        stockSheet =
            workbook.addWorksheet(
                "MONTHLY_STOCK"
            );

    }


    // =================================================
    // REMOVE CURRENT MONTH
    // =================================================

    const rowsToDelete = [];


    for (
        let rowNumber = 2;
        rowNumber <= stockSheet.rowCount;
        rowNumber++
    ) {

        const row =
            stockSheet.getRow(
                rowNumber
            );


        const rowMonth =
            getText(
                row.getCell(1).value
            );


        if (
            rowMonth === month
        ) {

            rowsToDelete.push(
                rowNumber
            );

        }

    }


    rowsToDelete
        .reverse()
        .forEach(
            rowNumber => {

                stockSheet.spliceRows(
                    rowNumber,
                    1
                );

            }
        );


    // =================================================
    // PREVIOUS MONTH
    // =================================================

    const previousMonth =
        getPreviousMonth(
            month
        );


    // =================================================
    // PREVIOUS CLOSING STOCK
    // =================================================

    const previousClosing = {};


    for (
        let rowNumber = 2;
        rowNumber <= stockSheet.rowCount;
        rowNumber++
    ) {

        const row =
            stockSheet.getRow(
                rowNumber
            );


        const rowMonth =
            getText(
                row.getCell(1).value
            );


        const itemName =
            getText(
                row.getCell(2).value
            );


        if (
            rowMonth === previousMonth
        ) {

            previousClosing[itemName] =
                Number(
                    row.getCell(12).value || 0
                );

        }

    }


    // =================================================
    // READ ITEM MASTER
    // =================================================

    const items = [];


    for (
        let rowNumber = 2;
        rowNumber <= itemSheet.rowCount;
        rowNumber++
    ) {

        const row =
            itemSheet.getRow(
                rowNumber
            );


        const itemName =
            getText(
                row.getCell(1).value
            );


        if (!itemName) {

            continue;

        }


        const price =
            Number(
                row.getCell(2).value || 0
            );


        const initialOpening =
            Number(
                row.getCell(3).value || 0
            );


        items.push({

            name:
                itemName,

            price:
                price,

            initialOpening:
                initialOpening

        });

    }


    // =================================================
    // CALCULATE EACH ITEM
    // =================================================

    for (
        const item of items
    ) {

        // ---------------------------------------------
        // OPENING
        // ---------------------------------------------

        let openingStock;


        if (
            previousClosing[item.name] !== undefined
        ) {

            openingStock =
                previousClosing[item.name];

        }

        else {

            openingStock =
                item.initialOpening;

        }


        // ---------------------------------------------
        // SUPPLY
        // ---------------------------------------------

        let supplyQuantity = 0;


        if (supplySheet) {

            for (
                let rowNumber = 2;
                rowNumber <= supplySheet.rowCount;
                rowNumber++
            ) {

                const row =
                    supplySheet.getRow(
                        rowNumber
                    );


                const rowMonth =
                    getText(
                        row.getCell(2).value
                    );


                const rowItem =
                    getText(
                        row.getCell(3).value
                    );


                if (
                    rowMonth === month &&
                    rowItem === item.name
                ) {

                    supplyQuantity +=
                        Number(
                            row.getCell(4).value || 0
                        );

                }

            }

        }


        // ---------------------------------------------
        // SALES
        // ---------------------------------------------

        let salesQuantity = 0;


        if (salesSheet) {

            for (
                let rowNumber = 2;
                rowNumber <= salesSheet.rowCount;
                rowNumber++
            ) {

                const row =
                    salesSheet.getRow(
                        rowNumber
                    );


                const rowDate =
                    getDate(
                        row.getCell(1).value
                    );


                const rowItem =
                    getText(
                        row.getCell(3).value
                    );


                if (
                    rowDate.startsWith(month) &&
                    rowItem === item.name
                ) {

                    salesQuantity +=
                        Number(
                            row.getCell(5).value || 0
                        );

                }

            }

        }


        // ---------------------------------------------
        // CALCULATIONS
        // ---------------------------------------------

        const openingValue =
            openingStock *
            item.price;


        const supplyValue =
            supplyQuantity *
            item.price;


        const totalStock =
            openingStock +
            supplyQuantity;


        const totalValue =
            totalStock *
            item.price;


        const saleValue =
            salesQuantity *
            item.price;


        const closingStock =
            totalStock -
            salesQuantity;


        const closingValue =
            closingStock *
            item.price;


        // ---------------------------------------------
        // ADD ROW
        // ---------------------------------------------

        stockSheet.addRow([

            month,

            item.name,

            item.price,

            openingStock,

            openingValue,

            supplyQuantity,

            supplyValue,

            totalStock,

            totalValue,

            salesQuantity,

            saleValue,

            closingStock,

            closingValue

        ]);

    }


    // =================================================
    // HEADER
    // =================================================

    const header =
        stockSheet.getRow(1);


    header.values = [

        "MONTH",

        "ITEM NAME",

        "UNIT PRICE",

        "OPENING STOCK",

        "OPENING VALUE",

        "SUPPLY",

        "SUPPLY VALUE",

        "TOTAL STOCK",

        "TOTAL VALUE",

        "SALES QUANTITY",

        "SALE VALUE",

        "CLOSING STOCK",

        "CLOSING VALUE"

    ];


    header.font = {

        bold: true

    };


    // =================================================
    // COLUMN WIDTH
    // =================================================

    stockSheet.getColumn(1).width = 12;

    stockSheet.getColumn(2).width = 35;

    stockSheet.getColumn(3).width = 15;

    stockSheet.getColumn(4).width = 16;

    stockSheet.getColumn(5).width = 18;

    stockSheet.getColumn(6).width = 12;

    stockSheet.getColumn(7).width = 18;

    stockSheet.getColumn(8).width = 15;

    stockSheet.getColumn(9).width = 18;

    stockSheet.getColumn(10).width = 18;

    stockSheet.getColumn(11).width = 15;

    stockSheet.getColumn(12).width = 18;

    stockSheet.getColumn(13).width = 18;

}


// =====================================================
// REBUILD DAILY SALES REPORT
// =====================================================

async function rebuildDailySalesReport(
    workbook
) {

    const salesSheet =
        workbook.getWorksheet(
            "SALES"
        );


    if (!salesSheet) {

        return;

    }


    // =================================================
    // DELETE OLD REPORT
    // =================================================

    const oldReport =
        workbook.getWorksheet(
            "DAILY_SALES_REPORT"
        );


    if (oldReport) {

        workbook.removeWorksheet(
            oldReport.id
        );

    }


    // =================================================
    // CREATE NEW REPORT
    // =================================================

    const reportSheet =
        workbook.addWorksheet(
            "DAILY_SALES_REPORT"
        );


    // =================================================
    // STORE SALES BY DATE + ITEM
    // =================================================

    const dailySales = {};


    for (
        let rowNumber = 2;
        rowNumber <= salesSheet.rowCount;
        rowNumber++
    ) {

        const row =
            salesSheet.getRow(
                rowNumber
            );


        const date =
            getDate(
                row.getCell(1).value
            );


        const item =
            getText(
                row.getCell(3).value
            );


        const price =
            Number(
                row.getCell(4).value || 0
            );


        const quantity =
            Number(
                row.getCell(5).value || 0
            );


        const saleValue =
            Number(
                row.getCell(6).value || 0
            );


        if (
            !date ||
            !item
        ) {

            continue;

        }


        if (
            !dailySales[date]
        ) {

            dailySales[date] = {};

        }


        if (
            !dailySales[date][item]
        ) {

            dailySales[date][item] = {

                price:
                    price,

                quantity:
                    0,

                saleValue:
                    0

            };

        }


        dailySales[date][item].quantity +=
            quantity;


        dailySales[date][item].saleValue +=
            saleValue;

    }


    // =================================================
    // SORT DATES
    // =================================================

    const dates =
        Object.keys(
            dailySales
        ).sort();


    // =================================================
    // CREATE DAILY SECTIONS
    // =================================================

    for (
        const date of dates
    ) {

        const dateObject =
            new Date(
                `${date}T00:00:00`
            );


        const day =
            dateObject.getDate();


        const monthName =
            dateObject.toLocaleString(
                "en-US",
                {
                    month: "long"
                }
            );


        const year =
            dateObject.getFullYear();


        // ---------------------------------------------
        // TITLE
        // ---------------------------------------------

        const titleRow =
            reportSheet.addRow([

                `SALES - ${day} ${monthName.toUpperCase()} ${year}`

            ]);


        titleRow.font = {

            bold: true,

            size: 14

        };


        // ---------------------------------------------
        // EMPTY ROW
        // ---------------------------------------------

        reportSheet.addRow([]);


        // ---------------------------------------------
        // HEADER
        // ---------------------------------------------

        const headerRow =
            reportSheet.addRow([

                "DATE",

                "ITEM NAME",

                "UNIT PRICE",

                "QUANTITY",

                "SALE VALUE"

            ]);


        headerRow.font = {

            bold: true

        };


        // ---------------------------------------------
        // TOTALS
        // ---------------------------------------------

        let dailyQuantity = 0;

        let dailyValue = 0;


        // ---------------------------------------------
        // ITEMS
        // ---------------------------------------------

        const items =
            Object.keys(
                dailySales[date]
            );


        for (
            const itemName of items
        ) {

            const data =
                dailySales[date][itemName];


            reportSheet.addRow([

                date,

                itemName,

                data.price,

                data.quantity,

                data.saleValue

            ]);


            dailyQuantity +=
                data.quantity;


            dailyValue +=
                data.saleValue;

        }


        // ---------------------------------------------
        // DAILY TOTAL
        // ---------------------------------------------

        const totalRow =
            reportSheet.addRow([

                "",

                "DAILY TOTAL",

                "",

                dailyQuantity,

                dailyValue

            ]);


        totalRow.font = {

            bold: true

        };


        reportSheet.addRow([]);

        reportSheet.addRow([]);

    }


    // =================================================
    // COLUMN WIDTHS
    // =================================================

    reportSheet.getColumn(1).width = 15;

    reportSheet.getColumn(2).width = 35;

    reportSheet.getColumn(3).width = 15;

    reportSheet.getColumn(4).width = 12;

    reportSheet.getColumn(5).width = 15;


    console.log(
        "DAILY_SALES_REPORT rebuilt successfully"
    );

}


// =====================================================
// SAVE SALE
// =====================================================

app.post(
    "/save-sale",
    async (req, res) => {

        try {

            const sale =
                req.body;


            console.log(
                "Sale received:",
                sale
            );


            // =================================================
            // VALIDATION
            // =================================================

            if (
                !sale.date ||
                !sale.item ||
                sale.price === undefined ||
                !sale.quantity
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter all sales details."

                });

            }


            const quantity =
                Number(
                    sale.quantity
                );


            const price =
                Number(
                    sale.price
                );


            if (
                isNaN(quantity) ||
                quantity <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid quantity."

                });

            }


            if (
                isNaN(price) ||
                price <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid price."

                });

            }


            const month =
                sale.date.substring(
                    0,
                    7
                );


            // =================================================
            // DOWNLOAD LATEST GITHUB FILE
            // =================================================

            await downloadExcelFromGitHub();


            // =================================================
            // OPEN WORKBOOK
            // =================================================

            const workbook =
                new ExcelJS.Workbook();


            await workbook.xlsx.readFile(
                filePath
            );


            let salesSheet =
                workbook.getWorksheet(
                    "SALES"
                );


            if (!salesSheet) {

                salesSheet =
                    workbook.addWorksheet(
                        "SALES"
                    );

            }


            // =================================================
            // SALES HEADER
            // =================================================

            if (
                salesSheet.rowCount === 0
            ) {

                salesSheet.addRow([

                    "DATE",

                    "MONTH",

                    "ITEM NAME",

                    "UNIT PRICE",

                    "QUANTITY",

                    "SALE VALUE"

                ]);

            }


            // =================================================
            // FIND SAME DATE + ITEM
            // =================================================

            let existingRow = null;


            for (
                let rowNumber = 2;
                rowNumber <= salesSheet.rowCount;
                rowNumber++
            ) {

                const row =
                    salesSheet.getRow(
                        rowNumber
                    );


                const rowDate =
                    getDate(
                        row.getCell(1).value
                    );


                const rowItem =
                    getText(
                        row.getCell(3).value
                    );


                if (
                    !rowDate ||
                    !rowItem
                ) {

                    continue;

                }


                if (
                    rowDate === sale.date &&
                    rowItem === sale.item
                ) {

                    existingRow =
                        row;

                    break;

                }

            }


            console.log(
                "Looking for existing sale..."
            );


            console.log(
                "Date from website:",
                sale.date
            );


            console.log(
                "Item from website:",
                sale.item
            );


            console.log(
                "Existing row:",
                existingRow
            );


            // =================================================
            // UPDATE EXISTING SALE
            // =================================================

            if (existingRow) {

                const oldQuantity =
                    Number(
                        existingRow
                            .getCell(5)
                            .value || 0
                    );


                const newQuantity =
                    oldQuantity +
                    quantity;


                const newSaleValue =
                    newQuantity *
                    price;


                existingRow
                    .getCell(5)
                    .value =
                    newQuantity;


                existingRow
                    .getCell(6)
                    .value =
                    newSaleValue;


                console.log(
                    "Existing sale updated."
                );

            }


            // =================================================
            // NEW SALE
            // =================================================

            else {

                const saleValue =
                    price *
                    quantity;


                salesSheet.addRow([

                    sale.date,

                    month,

                    sale.item,

                    price,

                    quantity,

                    saleValue

                ]);


                console.log(
                    "New sale row created."
                );

            }


            // =================================================
            // REBUILD MONTHLY STOCK
            // =================================================

            await rebuildMonthlyStock(
                workbook,
                month
            );


            // =================================================
            // REBUILD DAILY SALES REPORT
            // =================================================

            await rebuildDailySalesReport(
                workbook
            );


            // =================================================
            // CREATE UPDATED EXCEL BUFFER
            // =================================================

            const updatedBuffer =
                await workbook.xlsx.writeBuffer();


            // =================================================
            // SAVE LOCAL COPY
            // =================================================

            fs.writeFileSync(
                filePath,
                Buffer.from(
                    updatedBuffer
                )
            );


            // =================================================
            // UPLOAD EXACT BUFFER TO GITHUB
            // =================================================

            await uploadExcelToGitHub(
                Buffer.from(
                    updatedBuffer
                )
            );


            console.log(
                "Sales and reports updated successfully."
            );


            res.json({

                success: true,

                message:
                    existingRow
                        ? "Existing sale updated successfully!"
                        : "Sale saved successfully!"

            });

        }

        catch (error) {

            console.error(
                "SAVE SALE ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Error saving sale: " +
                    error.message

            });

        }

    }
);


// =====================================================
// DELETE SALE
// =====================================================

app.delete(
    "/delete-sale",
    async (req, res) => {

        try {

            const sale =
                req.body || {};

            const date =
                sale.date;

            const item =
                sale.item;

            if (!date || !item) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Date and item are required to delete a sale."

                });

            }

            const month =
                date.substring(
                    0,
                    7
                );

            await downloadExcelFromGitHub();

            const workbook =
                new ExcelJS.Workbook();

            await workbook.xlsx.readFile(filePath);

            const salesSheet =
                workbook.getWorksheet("SALES");

            if (!salesSheet) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No sales sheet found."

                });

            }

            const rowsToDelete = [];

            for (
                let rowNumber = 2;
                rowNumber <= salesSheet.rowCount;
                rowNumber++
            ) {

                const row =
                    salesSheet.getRow(rowNumber);

                const rowDate =
                    getDate(row.getCell(1).value);

                const rowItem =
                    getText(row.getCell(3).value);

                if (
                    rowDate === date &&
                    rowItem === item
                ) {

                    rowsToDelete.push(rowNumber);

                }

            }

            if (rowsToDelete.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Sale not found."

                });

            }

            rowsToDelete
                .reverse()
                .forEach(
                    rowNumber => {

                        salesSheet.spliceRows(
                            rowNumber,
                            1
                        );

                    }
                );

            await rebuildMonthlyStock(
                workbook,
                month
            );

            await rebuildDailySalesReport(
                workbook
            );

            const updatedBuffer =
                await workbook.xlsx.writeBuffer();

            fs.writeFileSync(
                filePath,
                Buffer.from(updatedBuffer)
            );

            await uploadExcelToGitHub(
                Buffer.from(updatedBuffer)
            );

            res.json({

                success: true,

                message:
                    "Sale deleted successfully!"

            });

        }

        catch (error) {

            console.error(
                "DELETE SALE ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error deleting sale: " +
                    error.message

            });

        }

    }
);


// =====================================================
// SAVE SUPPLY
// =====================================================

app.post(
    "/save-supply",
    async (req, res) => {

        try {

            const supply =
                req.body;


            if (
                !supply.date ||
                !supply.item ||
                !supply.quantity
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter supply details."

                });

            }


            const quantity =
                Number(
                    supply.quantity
                );


            if (
                isNaN(quantity) ||
                quantity <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid supply quantity."

                });

            }


            const month =
                supply.date.substring(
                    0,
                    7
                );


            // =================================================
            // DOWNLOAD LATEST GITHUB FILE
            // =================================================

            await downloadExcelFromGitHub();


            // =================================================
            // OPEN WORKBOOK
            // =================================================

            const workbook =
                new ExcelJS.Workbook();


            await workbook.xlsx.readFile(
                filePath
            );


            let sheet =
                workbook.getWorksheet(
                    "SUPPLY"
                );


            if (!sheet) {

                sheet =
                    workbook.addWorksheet(
                        "SUPPLY"
                    );

            }


            // =================================================
            // HEADER
            // =================================================

            if (
                sheet.rowCount === 0
            ) {

                sheet.addRow([

                    "DATE",

                    "MONTH",

                    "ITEM NAME",

                    "QUANTITY"

                ]);

            }


            // =================================================
            // ADD SUPPLY
            // =================================================

            sheet.addRow([

                supply.date,

                month,

                supply.item,

                quantity

            ]);


            // =================================================
            // REBUILD MONTHLY STOCK
            // =================================================

            await rebuildMonthlyStock(
                workbook,
                month
            );


            // =================================================
            // CREATE BUFFER
            // =================================================

            const updatedBuffer =
                await workbook.xlsx.writeBuffer();


            // =================================================
            // SAVE LOCAL COPY
            // =================================================

            fs.writeFileSync(
                filePath,
                Buffer.from(
                    updatedBuffer
                )
            );


            // =================================================
            // UPLOAD TO GITHUB
            // =================================================

            await uploadExcelToGitHub(
                Buffer.from(
                    updatedBuffer
                )
            );


            res.json({

                success: true,

                message:
                    "Supply saved successfully!"

            });

        }

        catch (error) {

            console.error(
                "SAVE SUPPLY ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Error saving supply: " +
                    error.message

            });

        }

    }
);


// =====================================================
// GET MONTHLY STOCK
// =====================================================

app.get(
    "/monthly-stock",
    async (req, res) => {

        try {

            const month =
                req.query.month;


            if (!month) {

                return res.status(400).json({

                    message:
                        "Please provide month"

                });

            }


            // Download latest GitHub file

            await downloadExcelFromGitHub();


            const workbook =
                new ExcelJS.Workbook();


            await workbook.xlsx.readFile(
                filePath
            );


            await rebuildMonthlyStock(
                workbook,
                month
            );


            const stockSheet =
                workbook.getWorksheet(
                    "MONTHLY_STOCK"
                );


            const result = [];


            for (
                let rowNumber = 2;
                rowNumber <= stockSheet.rowCount;
                rowNumber++
            ) {

                const row =
                    stockSheet.getRow(
                        rowNumber
                    );


                const rowMonth =
                    getText(
                        row.getCell(1).value
                    );


                if (
                    rowMonth !== month
                ) {

                    continue;

                }


                result.push({

                    itemName:
                        getText(
                            row.getCell(2).value
                        ),

                    unitPrice:
                        Number(
                            row.getCell(3).value || 0
                        ),

                    openingStock:
                        Number(
                            row.getCell(4).value || 0
                        ),

                    openingValue:
                        Number(
                            row.getCell(5).value || 0
                        ),

                    supply:
                        Number(
                            row.getCell(6).value || 0
                        ),

                    supplyValue:
                        Number(
                            row.getCell(7).value || 0
                        ),

                    totalStock:
                        Number(
                            row.getCell(8).value || 0
                        ),

                    totalValue:
                        Number(
                            row.getCell(9).value || 0
                        ),

                    salesQuantity:
                        Number(
                            row.getCell(10).value || 0
                        ),

                    saleValue:
                        Number(
                            row.getCell(11).value || 0
                        ),

                    closingStock:
                        Number(
                            row.getCell(12).value || 0
                        ),

                    closingValue:
                        Number(
                            row.getCell(13).value || 0
                        )

                });

            }


            res.json(
                result
            );

        }

        catch (error) {

            console.error(
                "MONTHLY STOCK ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Error calculating monthly stock"

            });

        }

    }
);


// =====================================================
// REBUILD ALL REPORTS
// =====================================================

async function rebuildAllReports() {

    const workbook =
        new ExcelJS.Workbook();


    await workbook.xlsx.readFile(
        filePath
    );


    // =================================================
    // CURRENT MONTH
    // =================================================

    const today =
        new Date();


    const currentMonth =
        today.getFullYear() +
        "-" +
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    // =================================================
    // SALES SHEET
    // =================================================

    const salesSheet =
        workbook.getWorksheet(
            "SALES"
        );


    // =================================================
    // FIND ALL MONTHS
    // =================================================

    const months =
        new Set();


    if (salesSheet) {

        for (
            let rowNumber = 2;
            rowNumber <= salesSheet.rowCount;
            rowNumber++
        ) {

            const row =
                salesSheet.getRow(
                    rowNumber
                );


            const date =
                getDate(
                    row.getCell(1).value
                );


            if (date) {

                months.add(
                    date.substring(
                        0,
                        7
                    )
                );

            }

        }

    }


    // =================================================
    // ALWAYS CURRENT MONTH
    // =================================================

    months.add(
        currentMonth
    );


    // =================================================
    // REBUILD MONTHLY STOCK
    // =================================================

    for (
        const month of months
    ) {

        await rebuildMonthlyStock(
            workbook,
            month
        );

    }


    // =================================================
    // REBUILD DAILY REPORT
    // =================================================

    if (salesSheet) {

        await rebuildDailySalesReport(
            workbook
        );

    }


    // =================================================
    // SAVE LOCAL FILE
    // =================================================

    const updatedBuffer =
        await workbook.xlsx.writeBuffer();


    fs.writeFileSync(
        filePath,
        Buffer.from(
            updatedBuffer
        )
    );


    console.log(
        "All reports rebuilt successfully."
    );

}


// =====================================================
// DASHBOARD SUMMARY
// =====================================================

app.get(
    "/dashboard-summary",
    async (req, res) => {

        try {

            await downloadExcelFromGitHub();


            const workbook =
                new ExcelJS.Workbook();


            await workbook.xlsx.readFile(
                filePath
            );


            const itemSheet =
                workbook.getWorksheet(
                    "ITEM_MASTER"
                );


            const salesSheet =
                workbook.getWorksheet(
                    "SALES"
                );


            const stockSheet =
                workbook.getWorksheet(
                    "MONTHLY_STOCK"
                );


            // =============================================
            // TOTAL ITEMS
            // =============================================

            let totalItems = 0;


            if (itemSheet) {

                for (
                    let rowNumber = 2;
                    rowNumber <= itemSheet.rowCount;
                    rowNumber++
                ) {

                    const itemName =
                        getText(
                            itemSheet
                                .getRow(
                                    rowNumber
                                )
                                .getCell(1)
                                .value
                        );


                    if (itemName) {

                        totalItems++;

                    }

                }

            }


            // =============================================
            // TODAY
            // =============================================

            const today =
                new Date();


            const todayString =
                today.getFullYear() +
                "-" +
                String(
                    today.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                ) +
                "-" +
                String(
                    today.getDate()
                ).padStart(
                    2,
                    "0"
                );


            // =============================================
            // TODAY SALES
            // =============================================

            let todaySales = 0;


            if (salesSheet) {

                for (
                    let rowNumber = 2;
                    rowNumber <= salesSheet.rowCount;
                    rowNumber++
                ) {

                    const row =
                        salesSheet.getRow(
                            rowNumber
                        );


                    const saleDate =
                        getDate(
                            row.getCell(1).value
                        );


                    const saleValue =
                        Number(
                            row.getCell(6).value || 0
                        );


                    if (
                        saleDate === todayString
                    ) {

                        todaySales +=
                            saleValue;

                    }

                }

            }


            // =============================================
            // CURRENT MONTH
            // =============================================

            const currentMonth =
                todayString.substring(
                    0,
                    7
                );


            // =============================================
            // TOTAL STOCK
            // =============================================

            let totalStock = 0;

            let lowStock = 0;


            if (stockSheet) {

                for (
                    let rowNumber = 2;
                    rowNumber <= stockSheet.rowCount;
                    rowNumber++
                ) {

                    const row =
                        stockSheet.getRow(
                            rowNumber
                        );


                    const rowMonth =
                        getText(
                            row.getCell(1).value
                        );


                    if (
                        rowMonth !== currentMonth
                    ) {

                        continue;

                    }


                    const closingStock =
                        Number(
                            row.getCell(12).value || 0
                        );


                    totalStock +=
                        closingStock;


                    if (
                        closingStock <= 10
                    ) {

                        lowStock++;

                    }

                }

            }


            res.json({

                totalItems:
                    totalItems,

                todaySales:
                    todaySales,

                totalStock:
                    totalStock,

                lowStock:
                    lowStock

            });

        }

        catch (error) {

            console.error(
                "DASHBOARD ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to load dashboard",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// DASHBOARD INVENTORY
// =====================================================

app.get(
    "/dashboard-inventory",
    async (req, res) => {

        try {

            await downloadExcelFromGitHub();


            const workbook =
                new ExcelJS.Workbook();


            await workbook.xlsx.readFile(
                filePath
            );


            const stockSheet =
                workbook.getWorksheet(
                    "MONTHLY_STOCK"
                );


            if (!stockSheet) {

                return res.json([]);

            }


            const today =
                new Date();


            const currentMonth =
                today.getFullYear() +
                "-" +
                String(
                    today.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            const inventory = [];


            for (
                let rowNumber = 2;
                rowNumber <= stockSheet.rowCount;
                rowNumber++
            ) {

                const row =
                    stockSheet.getRow(
                        rowNumber
                    );


                const month =
                    getText(
                        row.getCell(1).value
                    );


                if (
                    month !== currentMonth
                ) {

                    continue;

                }


                const itemName =
                    getText(
                        row.getCell(2).value
                    );


                const closingStock =
                    Number(
                        row.getCell(12).value || 0
                    );


                if (!itemName) {

                    continue;

                }


                let status =
                    "In Stock";


                if (
                    closingStock <= 0
                ) {

                    status =
                        "Out of Stock";

                }

                else if (
                    closingStock <= 10
                ) {

                    status =
                        "Low Stock";

                }


                inventory.push({

                    sno:
                        inventory.length + 1,

                    itemName:
                        itemName,

                    stock:
                        closingStock,

                    status:
                        status

                });

            }


            res.json(
                inventory
            );

        }

        catch (error) {

            console.error(
                "DASHBOARD INVENTORY ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to load inventory"

            });

        }

    }
);


// =====================================================
// GET DAILY SALES REPORT
// =====================================================

app.get(
    "/daily-sales-report",
    async (req, res) => {

        try {

            await downloadExcelFromGitHub();


            const workbook =
                new ExcelJS.Workbook();


            await workbook.xlsx.readFile(
                filePath
            );


            const sheet =
                workbook.getWorksheet(
                    "DAILY_SALES_REPORT"
                );


            if (!sheet) {

                return res.json([]);

            }


            const report = [];


            for (
                let rowNumber = 1;
                rowNumber <= sheet.rowCount;
                rowNumber++
            ) {

                const row =
                    sheet.getRow(
                        rowNumber
                    );


                const values = [];


                for (
                    let columnNumber = 1;
                    columnNumber <= 5;
                    columnNumber++
                ) {

                    values.push(
                        getText(
                            row.getCell(
                                columnNumber
                            ).value
                        )
                    );

                }


                if (
                    values.every(
                        value =>
                            value === ""
                    )
                ) {

                    continue;

                }


                report.push(
                    values
                );

            }


            res.json(
                report
            );

        }

        catch (error) {

            console.error(
                "DAILY SALES REPORT ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to load daily sales report"

            });

        }

    }
);


// =====================================================
// START SERVER
// =====================================================

const PORT =
    process.env.PORT || 3000;


async function startServer() {

    try {

        console.log(
            "Downloading latest Excel file from GitHub..."
        );


        // =================================================
        // DOWNLOAD LATEST FILE
        // =================================================

        await downloadExcelFromGitHub();


        // =================================================
        // REBUILD REPORTS
        // =================================================

        await rebuildAllReports();

        



        // =================================================
        // START EXPRESS
        // =================================================

        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    `Server running on port ${PORT}`
                );

            }
        );

    }

    catch (error) {

        console.error(
            "SERVER STARTUP ERROR:",
            error
        );


        process.exit(1);

    }

}



// =====================================================
// ADD NEW ITEM
// =====================================================

app.post("/add-item", async (req, res) => {

    try {

        const {
            itemName,
            unitPrice,
            openingStock
        } = req.body;


        // =============================================
        // VALIDATION
        // =============================================

        if (!itemName || itemName.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Please enter item name."
            });

        }


        if (
            unitPrice === undefined ||
            unitPrice === null ||
            Number(unitPrice) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid unit price."
            });

        }


        if (
            openingStock === undefined ||
            openingStock === null ||
            Number(openingStock) < 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid opening stock."
            });

        }


        const name =
            itemName.trim();

        const price =
            Number(unitPrice);

        const stock =
            Number(openingStock);


        // =============================================
        // LOAD EXCEL
        // =============================================

        const workbook =
            new ExcelJS.Workbook();

        await workbook.xlsx.readFile(
            EXCEL_FILE
        );


        // =============================================
        // ITEM MASTER
        // =============================================

        const itemMaster =
            workbook.getWorksheet(
                "ITEM_MASTER"
            );


        if (!itemMaster) {

            return res.status(500).json({
                success: false,
                message: "ITEM_MASTER sheet not found."
            });

        }


        // =============================================
        // CHECK DUPLICATE ITEM
        // =============================================

        let duplicate = false;


        itemMaster.eachRow(
            (row, rowNumber) => {

                if (rowNumber === 1) {
                    return;
                }


                const existingName =
                    getText(
                        row.getCell(1).value
                    )
                    .trim()
                    .toLowerCase();


                if (
                    existingName ===
                    name.toLowerCase()
                ) {

                    duplicate = true;

                }

            }
        );


        if (duplicate) {

            return res.status(400).json({
                success: false,
                message:
                    `"${name}" already exists in ITEM_MASTER.`
            });

        }


        // =============================================
        // ADD TO ITEM_MASTER
        // =============================================

        itemMaster.addRow([
            name,
            price,
            stock
        ]);


        // =============================================
        // CURRENT MONTH
        // =============================================

        const now =
            new Date();

        const currentMonth =
            `${now.getFullYear()}-${String(
                now.getMonth() + 1
            ).padStart(2, "0")}`;


        // =============================================
        // MONTHLY STOCK
        // =============================================

        let monthlyStock =
            workbook.getWorksheet(
                "MONTHLY_STOCK"
            );


        if (!monthlyStock) {

            monthlyStock =
                workbook.addWorksheet(
                    "MONTHLY_STOCK"
                );

            monthlyStock.addRow([
                "MONTH",
                "ITEM NAME",
                "UNIT PRICE",
                "OPENING STOCK",
                "OPENING VALUE",
                "SUPPLY",
                "SUPPLY VALUE",
                "TOTAL STOCK",
                "TOTAL VALUE",
                "SALES QUANTITY",
                "SALE VALUE",
                "CLOSING STOCK",
                "CLOSING VALUE"
            ]);

        }


        // =============================================
        // CALCULATE VALUES
        // =============================================

        const openingValue =
            stock * price;

        const supply =
            0;

        const supplyValue =
            0;

        const totalStock =
            stock + supply;

        const totalValue =
            openingValue + supplyValue;

        const salesQuantity =
            0;

        const saleValue =
            0;

        const closingStock =
            totalStock - salesQuantity;

        const closingValue =
            closingStock * price;


        // =============================================
        // ADD TO MONTHLY STOCK
        // =============================================

        monthlyStock.addRow([
            currentMonth,
            name,
            price,
            stock,
            openingValue,
            supply,
            supplyValue,
            totalStock,
            totalValue,
            salesQuantity,
            saleValue,
            closingStock,
            closingValue
        ]);


        // =============================================
// SAVE EXCEL LOCALLY
// =============================================

await workbook.xlsx.writeFile(
    EXCEL_FILE
);


// =============================================
// READ UPDATED EXCEL FILE
// =============================================

const updatedFileBuffer =
    fs.readFileSync(
        EXCEL_FILE
    );


// =============================================
// UPLOAD UPDATED EXCEL TO GITHUB
// =============================================

await uploadExcelToGitHub(
    updatedFileBuffer
);


        // =============================================
        // SUCCESS
        // =============================================

        res.json({

            success: true,

            message:
                `"${name}" added successfully.`

        });

    }

    catch (error) {

        console.error(
            "ADD ITEM ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to add new item."

        });

    }

});


startServer();