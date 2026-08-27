let items = [];


// =======================================
// LOAD ITEMS
// =======================================

async function loadItems() {

    try {

        const response =
            await fetch("/items");

        if (!response.ok) {

            throw new Error("Unable to load items");

        }

        items =
            await response.json();


        // ===================================
        // SALES DROPDOWN
        // ===================================

        const salesDropdown =
            document.getElementById("salesItem");


        if (salesDropdown) {

            // Remove old items except Select Item

            salesDropdown.innerHTML = `
                <option value="">
                    Select Item
                </option>
            `;


            items.forEach(item => {

                const option =
                    document.createElement("option");

                option.value =
                    item.name;

                option.textContent =
                    item.name;

                salesDropdown.appendChild(option);

            });

        }


        // ===================================
        // PURCHASE DROPDOWN
        // ===================================

        const supplyDropdown =
            document.getElementById("supplyItem");


        if (supplyDropdown) {

            // Remove old items except Select Item

            supplyDropdown.innerHTML = `
                <option value="">
                    Select Item
                </option>
            `;


            items.forEach(item => {

                const option =
                    document.createElement("option");

                option.value =
                    item.name;

                option.textContent =
                    item.name;

                supplyDropdown.appendChild(option);

            });

        }


        console.log(
            "Items loaded successfully:",
            items
        );

    }

    catch (error) {

        console.error(
            "LOAD ITEMS ERROR:",
            error
        );

    }

}


// =======================================
// SALES ITEM SELECTED
// =======================================

const salesItem =
    document.getElementById("salesItem");


if (salesItem) {

    salesItem.addEventListener(
        "change",
        async function () {

            const selectedItem =
                items.find(
                    item =>
                        item.name === this.value
                );


            const salesPrice =
                document.getElementById(
                    "salesPrice"
                );


            const availableStock =
                document.getElementById(
                    "availableStock"
                );


            if (!selectedItem) {

                if (salesPrice) {
                    salesPrice.value = "";
                }

                if (availableStock) {
                    availableStock.value = "";
                }

                return;

            }


            // =================================
            // SHOW PRICE
            // =================================

            if (salesPrice) {

                salesPrice.value =
                    selectedItem.price;

            }


            // =================================
            // GET DATE
            // =================================

            const salesDate =
                document.getElementById(
                    "salesDate"
                );


            if (!salesDate || !salesDate.value) {

                alert(
                    "Please select the sales date first."
                );

                this.value = "";

                if (salesPrice) {
                    salesPrice.value = "";
                }

                return;

            }


            const date =
                salesDate.value;


            const month =
                date.substring(0, 7);


            // =================================
            // GET CURRENT STOCK
            // =================================

            try {

                const response =
                    await fetch(
                        `/current-stock?item=${encodeURIComponent(selectedItem.name)}&month=${month}`
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Unable to get stock"
                    );

                }


                if (availableStock) {

                    availableStock.value =
                        result.stock;

                }

            }

            catch (error) {

                console.error(
                    "CURRENT STOCK ERROR:",
                    error
                );

                alert(
                    "Unable to get current stock"
                );

            }

        }
    );

}


// =======================================
// SALE QUANTITY
// =======================================

const salesQuantity =
    document.getElementById(
        "salesQuantity"
    );


if (salesQuantity) {

    salesQuantity.addEventListener(
        "input",
        function () {

            const price =
                Number(
                    document.getElementById(
                        "salesPrice"
                    )?.value || 0
                );


            const quantity =
                Number(this.value || 0);


            const saleValue =
                document.getElementById(
                    "saleValue"
                );


            if (saleValue) {

                saleValue.value =
                    price * quantity;

            }

        }
    );

}


// =======================================
// SALES DATE CHANGE
// =======================================

const salesDate =
    document.getElementById(
        "salesDate"
    );


if (salesDate) {

    salesDate.addEventListener(
        "change",
        function () {

            const salesItem =
                document.getElementById(
                    "salesItem"
                );

            const salesPrice =
                document.getElementById(
                    "salesPrice"
                );

            const availableStock =
                document.getElementById(
                    "availableStock"
                );

            const salesQuantity =
                document.getElementById(
                    "salesQuantity"
                );

            const saleValue =
                document.getElementById(
                    "saleValue"
                );


            if (salesItem) {
                salesItem.value = "";
            }

            if (salesPrice) {
                salesPrice.value = "";
            }

            if (availableStock) {
                availableStock.value = "";
            }

            if (salesQuantity) {
                salesQuantity.value = "";
            }

            if (saleValue) {
                saleValue.value = "";
            }

        }
    );

}


// =======================================
// SAVE SALE
// =======================================

async function saveSale() {

    const date =
        document.getElementById(
            "salesDate"
        ).value;


    const item =
        document.getElementById(
            "salesItem"
        ).value;


    const price =
        Number(
            document.getElementById(
                "salesPrice"
            ).value
        );


    const quantity =
        Number(
            document.getElementById(
                "salesQuantity"
            ).value
        );


    const saleValue =
        price * quantity;


    if (
        !date ||
        !item ||
        quantity <= 0
    ) {

        alert(
            "Please enter all sales details."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/save-sale",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        date:
                            date,

                        item:
                            item,

                        price:
                            price,

                        quantity:
                            quantity,

                        saleValue:
                            saleValue

                    })

                }
            );


        const result =
            await response.json();


        const message =
            document.getElementById(
                "message"
            );


        if (message) {

            message.textContent =
                result.message;

        }


        if (result.success) {

            document.getElementById(
                "salesQuantity"
            ).value = "";

            document.getElementById(
                "saleValue"
            ).value = "";

        }

    }

    catch (error) {

        console.error(
            "SAVE SALE ERROR:",
            error
        );

        alert(
            "Error saving sale."
        );

    }

}


// =======================================
// SAVE SUPPLY / PURCHASE
// =======================================

async function saveSupply() {

    const date =
        document.getElementById(
            "supplyDate"
        ).value;


    const item =
        document.getElementById(
            "supplyItem"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "supplyQuantity"
            ).value
        );


    if (
        !date ||
        !item ||
        quantity <= 0
    ) {

        alert(
            "Please enter all purchase details."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/save-supply",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        date:
                            date,

                        item:
                            item,

                        quantity:
                            quantity

                    })

                }
            );


        const result =
            await response.json();


        const message =
            document.getElementById(
                "message"
            );


        if (message) {

            message.textContent =
                result.message;

        }


        if (result.success) {

            document.getElementById(
                "supplyQuantity"
            ).value = "";

        }

    }

    catch (error) {

        console.error(
            "SAVE SUPPLY ERROR:",
            error
        );

        alert(
            "Error saving purchase."
        );

    }

}


// =======================================
// SHOW SALES
// =======================================

function showSales() {

    document
        .getElementById("dashboard")
        ?.classList.add("hidden");

    document
        .getElementById("salesForm")
        ?.classList.remove("hidden");

    document
        .getElementById("dailySalesReport")
        ?.classList.add("hidden");

    document
        .getElementById("supplyForm")
        ?.classList.add("hidden");

    document
        .getElementById("monthlyForm")
        ?.classList.add("hidden");

    updateNavigation("Sales");
}


// =======================================
// SHOW SUPPLY
// =======================================

function showSupply() {

    document.getElementById("dashboard")?.classList.add("hidden");

    document.getElementById("salesForm")?.classList.add("hidden");

    document.getElementById("dailySalesReport")?.classList.add("hidden");

    document.getElementById("monthlyForm")?.classList.add("hidden");

    document.getElementById("supplyForm")?.classList.remove("hidden");

    updateNavigation("Supply");
}

// =======================================
// SHOW MONTHLY STOCK
// =======================================

function showMonthlyStock() {

    document.getElementById("dashboard")?.classList.add("hidden");

    document.getElementById("salesForm")?.classList.add("hidden");

    document.getElementById("dailySalesReport")?.classList.add("hidden");

    document.getElementById("supplyForm")?.classList.add("hidden");

    document.getElementById("monthlyForm")?.classList.remove("hidden");

    updateNavigation("Monthly Stock");
}


// =======================================
// SHOW DAILY SALES REPORT
// =======================================

function showDailySalesReport() {

    document
        .getElementById("dashboard")
        ?.classList.add("hidden");

    document
        .getElementById("salesForm")
        ?.classList.add("hidden");

    document
        .getElementById("supplyForm")
        ?.classList.add("hidden");

    document
        .getElementById("monthlyForm")
        ?.classList.add("hidden");

    document
        .getElementById("dailySalesReport")
        ?.classList.remove("hidden");

    // Load the report
    loadDailySalesReport();

    updateNavigation("Daily Sales Report");
}


// =======================================
// GENERATE MONTHLY REPORT
// =======================================

async function generateReport() {

    const reportMonth =
        document.getElementById(
            "reportMonth"
        );


    if (!reportMonth) {
        return;
    }


    const month =
        reportMonth.value;


    if (!month) {

        alert(
            "Please select a month."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `/monthly-stock?month=${month}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to generate report"
            );

            return;

        }


        displayReport(data);

    }

    catch (error) {

        console.error(
            "REPORT ERROR:",
            error
        );

        alert(
            "Error generating report"
        );

    }

}


// =======================================
// DISPLAY REPORT
// =======================================

function displayReport(data) {

    let html = `

        <table>

            <thead>

                <tr>
                    <th>S.NO</th>
                    <th>ITEM NAME</th>
                    <th>UNIT PRICE</th>
                    <th>OPENING STOCK</th>
                    <th>OPENING VALUE</th>
                    <th>SUPPLY</th>
                    <th>SUPPLY VALUE</th>
                    <th>TOTAL STOCK</th>
                    <th>TOTAL VALUE</th>
                    <th>SALES QUANTITY</th>
                    <th>SALE VALUE</th>
                    <th>CLOSING STOCK</th>
                    <th>CLOSING VALUE</th>

                </tr>

            </thead>

            <tbody>
    `;


    let totalOpeningValue = 0;
    let totalSupplyValue = 0;
    let totalValue = 0;
    let totalSaleValue = 0;
    let totalClosingValue = 0;


    data.forEach((item, index) => {

        totalOpeningValue +=
            item.openingValue;

        totalSupplyValue +=
            item.supplyValue;

        totalValue +=
            item.totalValue;

        totalSaleValue +=
            item.saleValue;

        totalClosingValue +=
            item.closingValue;


        html += `

            <tr>
                <td>${index + 1}</td>
                <td>${item.itemName}</td>
                <td>${item.unitPrice}</td>
                <td>${item.openingStock}</td>
                <td>${item.openingValue}</td>
                <td>${item.supply}</td>
                <td>${item.supplyValue}</td>
                <td>${item.totalStock}</td>
                <td>${item.totalValue}</td>
                <td>${item.salesQuantity}</td>
                <td>${item.saleValue}</td>
                <td>${item.closingStock}</td>
                <td>${item.closingValue}</td>

            </tr>

        `;

    });


    html += `

            <tr>

                <th></th>

                <th>TOTAL</th>

                <th></th>

                <th></th>

                <th>${totalOpeningValue}</th>

                <th></th>

                <th>${totalSupplyValue}</th>

                <th></th>

                <th>${totalValue}</th>

                <th></th>

                <th>${totalSaleValue}</th>

                <th></th>

                <th>${totalClosingValue}</th>

            </tr>

        </tbody>

    </table>

    `;


    const report =
        document.getElementById(
            "monthlyReport"
        );


    if (report) {

        report.innerHTML =
            html;

    }

}


// =====================================================
// LOAD DASHBOARD INVENTORY
// =====================================================

async function loadDashboardInventory() {

    console.log("Inventory function started");

    try {

        const response =
            await fetch("/dashboard-inventory");

        console.log("API response:", response);

        const inventory =
            await response.json();

        console.log("Inventory data:", inventory);


        const tableBody =
            document.getElementById(
                "dashboardInventory"
            );


        if (!tableBody) {

            console.error(
                "dashboardInventory element not found"
            );

            return;

        }


        tableBody.innerHTML = "";


        // No inventory

        if (inventory.length === 0) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="3">
                        No inventory data available
                    </td>

                </tr>

            `;

            return;

        }


        // =============================================
        // DISPLAY INVENTORY
        // =============================================

        inventory.forEach((item, index) => {

            const row =
                document.createElement("tr");


            // =========================================
            // STATUS CLASS
            // =========================================

            let statusClass = "";


            if (item.status === "In Stock") {

                statusClass =
                    "status-in-stock";

            }

            else if (item.status === "Low Stock") {

                statusClass =
                    "status-low-stock";

            }

            else if (item.status === "Out of Stock") {

                statusClass =
                    "status-out-stock";

            }


            // =========================================
            // CREATE ROW
            // =========================================

            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${item.itemName}
                </td>

                <td>
                    ${item.stock}
                </td>

                <td>
                    <span class="stock-status ${statusClass}">
                        <span class="status-dot"></span>
                        ${item.status}
                    </span>
                </td>

            `;


            tableBody.appendChild(row);

        });


    }

    catch (error) {

        console.error(
            "Inventory error:",
            error
        );

    }

}

// Load items for Sales and Purchase dropdowns
loadItems();

// Load inventory

loadDashboardInventory();



// =======================================
// DOWNLOAD MONTHLY REPORT AS PDF
// =======================================

function downloadReportPDF() {

    // Check PDF library

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert("PDF library is not loaded.");

        return;

    }


    // Check report month

    const reportMonth =
        document.getElementById("reportMonth");


    if (
        !reportMonth ||
        !reportMonth.value
    ) {

        alert(
            "Please select and generate a report first."
        );

        return;

    }


    // Get loaded report table

    const table =
        document.querySelector(
            "#monthlyReport table"
        );


    if (!table) {

        alert(
            "Please generate the report first."
        );

        return;

    }


    // ===================================
    // CREATE PDF
    // ===================================

    const { jsPDF } =
        window.jspdf;


    const doc =
        new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });


    // ===================================
    // GET MONTH
    // ===================================

    const selectedMonth =
        reportMonth.value;


    const [year, monthNumber] =
        selectedMonth.split("-");


    const monthName =
        new Date(
            Number(year),
            Number(monthNumber) - 1,
            1
        ).toLocaleString(
            "en-IN",
            {
                month: "long"
            }
        );


    // ===================================
    // TITLE
    // ===================================

    doc.setFontSize(16);

    doc.text(
        "Daily Stock - Monthly Report",
        148,
        12,
        {
            align: "center"
        }
    );


    doc.setFontSize(11);

    doc.text(
        `${monthName} ${year}`,
        148,
        19,
        {
            align: "center"
        }
    );


    // ===================================
    // GET HEADERS
    // ===================================

    const headers = [];


    table
        .querySelectorAll("thead th")
        .forEach(th => {

            headers.push(
                th.textContent.trim()
            );

        });


    // ===================================
    // GET DATA ROWS
    // ===================================

    const rows = [];


    table
        .querySelectorAll("tbody tr")
        .forEach(row => {

            const cells = [];


            row
                .querySelectorAll("td, th")
                .forEach(cell => {

                    cells.push(
                        cell.textContent.trim()
                    );

                });


            if (cells.length > 0) {

                rows.push(cells);

            }

        });


    // ===================================
    // SPLIT INTO 20 ROWS
    // ===================================

    const totalRows =
        rows.length;


    const totalPages =
        Math.ceil(
            totalRows / 20
        );


    for (
        let page = 0;
        page < totalPages;
        page++
    ) {

        if (page > 0) {

            doc.addPage();

        }


        // =================================
        // PAGE TITLE
        // =================================

        if (page > 0) {

            doc.setFontSize(11);

            doc.text(
                `${monthName} ${year}`,
                148,
                10,
                {
                    align: "center"
                }
            );

        }


        // =================================
        // GET 20 ROWS
        // =================================

        const start =
            page * 20;


        const end =
            start + 20;


        const pageRows =
            rows.slice(
                start,
                end
            );


        // =================================
        // DRAW TABLE
        // =================================

        doc.autoTable({

            head: [
                headers
            ],

            body:
                pageRows,

            startY:
                page === 0 ? 25 : 17,

            theme:
                "grid",

            styles: {

                fontSize: 6.5,

                cellPadding: 1.5,

                halign: "center",

                valign: "middle",

                overflow: "linebreak"

            },

            headStyles: {

                fontSize: 6.5,

                fontStyle: "bold",

                halign: "center",

                valign: "middle"

            },

            columnStyles: {

                0: {
                    halign: "left"
                }

            }

        });


        // =================================
        // PAGE NUMBER
        // =================================

        doc.setFontSize(8);

        doc.text(
            `Page ${page + 1} of ${totalPages}`,
            270,
            202,
            {
                align: "right"
            }
        );

    }


    // ===================================
    // DOWNLOAD
    // ===================================

    doc.save(
        `Monthly_Stock_Report_${selectedMonth}.pdf`
    );

}



// =====================================================
// DAILY SALES REPORT PAGE
// =====================================================

async function loadDailySalesReport() {

    const container =
        document.getElementById(
            "dailySalesReportContainer"
        );


    // If we are not on the Daily Sales Report page,
    // do nothing.

    if (!container) {

        return;

    }


    try {

        const response =
            await fetch(
                "/daily-sales-report"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load daily sales report"
            );

        }


        const report =
            await response.json();


        // =================================================
        // NO DATA
        // =================================================

        if (
            !report ||
            report.length === 0
        ) {

            container.innerHTML = `

                <p>
                    No daily sales report available.
                </p>

            `;

            return;

        }


        // =================================================
        // CREATE TABLE
        // =================================================

        let html = `

            <table>

                <thead>

                    <tr>

                        <th>
                            Date
                        </th>

                        <th>
                            Item Name
                        </th>

                        <th>
                            Unit Price
                        </th>

                        <th>
                            Quantity
                        </th>

                        <th>
                            Sale Value
                        </th>

                    </tr>

                </thead>

                <tbody>

        `;


        // =================================================
        // LOOP REPORT
        // =================================================

        report.forEach(row => {


            // ---------------------------------------------
            // DAILY TITLE
            // ---------------------------------------------

            if (
                row[0] &&
                row[0].startsWith("SALES -")
            ) {

                html += `

                    <tr>

                        <td
                            colspan="5"
                            style="
                                font-weight:bold;
                                font-size:16px;
                            "
                        >

                            ${row[0]}

                        </td>

                    </tr>

                `;

                return;

            }


            // ---------------------------------------------
            // IGNORE HEADER
            // ---------------------------------------------

            if (
                row[0] === "DATE" &&
                row[1] === "ITEM NAME"
            ) {

                return;

            }


            // ---------------------------------------------
            // DAILY TOTAL
            // ---------------------------------------------

            if (
                row[1] === "DAILY TOTAL"
            ) {

                html += `

                    <tr>

                        <td></td>

                        <td>
                            <strong>
                                DAILY TOTAL
                            </strong>
                        </td>

                        <td></td>

                        <td>
                            <strong>
                                ${row[3]}
                            </strong>
                        </td>

                        <td>
                            <strong>
                                ₹${Number(
                                    row[4] || 0
                                ).toLocaleString("en-IN")}
                            </strong>
                        </td>

                    </tr>

                `;

                return;

            }


            // ---------------------------------------------
            // NORMAL SALE
            // ---------------------------------------------

            html += `

                <tr>

                    <td>
                        ${row[0]}
                    </td>

                    <td>
                        ${row[1]}
                    </td>

                    <td>
                        ₹${Number(
                            row[2] || 0
                        ).toLocaleString("en-IN")}
                    </td>

                    <td>
                        ${row[3]}
                    </td>

                    <td>
                        ₹${Number(
                            row[4] || 0
                        ).toLocaleString("en-IN")}
                    </td>

                </tr>

            `;

        });


        html += `

                </tbody>

            </table>

        `;


        // =================================================
        // DISPLAY REPORT
        // =================================================

        container.innerHTML =
            html;

    }

    catch (error) {

        console.error(
            "Daily Sales Report Error:",
            error
        );


        container.innerHTML = `

            <p style="color:red;">

                Unable to load daily sales report.

            </p>

        `;

    }

}

// =====================================================
// LOAD DAILY SALES REPORT PAGE
// =====================================================

if (
    document.getElementById(
        "dailySalesReportContainer"
    )
) {

    loadDailySalesReport();

}