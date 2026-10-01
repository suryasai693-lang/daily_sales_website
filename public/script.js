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

    let editingPurchase = null;

    async function loadPurchases() {
        const tableBody = document.getElementById("purchasesTable");
        if (!tableBody) return;

        try {
            const response = await fetch("/purchases");
            const purchases = await response.json();
            if (!response.ok) throw new Error(purchases.message || "Unable to load purchases.");

            tableBody.replaceChildren();
            if (!purchases.length) {
                const emptyRow = document.createElement("tr");
                const emptyCell = document.createElement("td");
                emptyCell.colSpan = 4;
                emptyCell.textContent = "No purchases found.";
                emptyRow.appendChild(emptyCell);
                tableBody.appendChild(emptyRow);
                return;
            }

            purchases.forEach(purchase => {
                const row = document.createElement("tr");
                for (const value of [purchase.date, purchase.item, purchase.quantity]) {
                    const cell = document.createElement("td");
                    cell.textContent = String(value);
                    row.appendChild(cell);
                }

                const actionCell = document.createElement("td");
                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.className = "secondary-button";
                editButton.textContent = "Edit";
                editButton.addEventListener("click", () => editPurchase(purchase));
                actionCell.appendChild(editButton);

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "secondary-button";
                deleteButton.textContent = "Delete";
                deleteButton.style.marginLeft = "6px";
                deleteButton.addEventListener("click", () => deletePurchase(purchase));
                actionCell.appendChild(deleteButton);

                row.appendChild(actionCell);
                tableBody.appendChild(row);
            });
        } catch (error) {
            tableBody.replaceChildren();
            const errorRow = document.createElement("tr");
            const errorCell = document.createElement("td");
            errorCell.colSpan = 4;
            errorCell.textContent = error.message || "Unable to load purchases.";
            errorRow.appendChild(errorCell);
            tableBody.appendChild(errorRow);
        }
    }

    function editPurchase(purchase) {
        editingPurchase = purchase;
        document.getElementById("supplyDate").value = purchase.date;
        document.getElementById("supplyItem").value = purchase.item;
        document.getElementById("supplyQuantity").value = purchase.quantity;
        document.getElementById("supplyQuantity").min = "0";
        document.getElementById("supplyFormTitle").textContent = "Edit Purchase";
        document.getElementById("saveSupplyButton").textContent = "Save Changes";
        document.getElementById("cancelSupplyEditButton").hidden = false;
        document.getElementById("supplyForm").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function cancelSupplyEdit() {
        editingPurchase = null;
        document.getElementById("supplyDate").value = "";
        document.getElementById("supplyItem").value = "";
        document.getElementById("supplyQuantity").value = "";
        document.getElementById("supplyQuantity").min = "1";
        document.getElementById("supplyFormTitle").textContent = "New Purchase";
        document.getElementById("saveSupplyButton").textContent = "💾 Save Purchase";
        document.getElementById("cancelSupplyEditButton").hidden = true;
    }

    async function deletePurchase(purchase) {
        const confirmed = window.confirm(
            `Delete this purchase of ${purchase.quantity} ${purchase.item} dated ${purchase.date}? Stock reports will be recalculated.`
        );
        if (!confirmed) return;

        try {
            const response = await fetch(`/purchases/${purchase.rowNumber}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalDate: purchase.date,
                    originalItem: purchase.item,
                    originalQuantity: purchase.quantity
                })
            });
            const result = await response.json();
            const message = document.getElementById("message");
            message.textContent = result.message;
            message.className = response.ok ? "success-message" : "error-message";
            if (!response.ok) return;

            if (editingPurchase?.rowNumber === purchase.rowNumber) cancelSupplyEdit();
            await loadPurchases();
        } catch (error) {
            const message = document.getElementById("message");
            message.textContent = error.message || "Unable to delete purchase.";
            message.className = "error-message";
        }
    }

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
            !Number.isInteger(quantity) ||
            (editingPurchase ? quantity < 0 : quantity <= 0)
        ) {

            alert(
                "Please enter all purchase details."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    editingPurchase ? `/purchases/${editingPurchase.rowNumber}` : "/save-supply",
                    {

                        method: editingPurchase ? "PUT" : "POST",

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
                                quantity,

                            ...(editingPurchase ? {
                                originalDate: editingPurchase.date,
                                originalItem: editingPurchase.item,
                                originalQuantity: editingPurchase.quantity
                            } : {})

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
                message.className = response.ok ? "success-message" : "error-message";

            }

            if (!response.ok) return;

            if (editingPurchase) {
                cancelSupplyEdit();
            } else {
                document.getElementById("supplyQuantity").value = "";
            }

            await loadPurchases();

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

    loadPurchases();

    // Load inventory on the dashboard only
    if (document.getElementById("dashboardInventory")) {
        loadDashboardInventory();
    }



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

        const dateInput =
            document.getElementById(
                "currentDate"
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

            // Get selected date from input
            const selectedDate =
                dateInput?.value || new Date()
                    .toISOString()
                    .split('T')[0];

            // Convert selected date to comparable format
            const selectedDateObj =
                new Date(
                    `${selectedDate}T00:00:00`
                );

            const selectedDay =
                selectedDateObj.getDate();

            const selectedMonth =
                selectedDateObj.toLocaleString(
                    "en-US",
                    {
                        month: "long"
                    }
                ).toUpperCase();

            const selectedYear =
                selectedDateObj.getFullYear();

            const expectedHeader =
                `SALES - ${selectedDay} ${selectedMonth} ${selectedYear}`;

            // Filter report to show only selected date
            const sectionStart = report.findIndex(
                row => row[0] === expectedHeader
            );

            const nextSectionStart = sectionStart === -1
                ? -1
                : report.findIndex(
                    (row, index) =>
                        index > sectionStart &&
                        row[0] &&
                        row[0].startsWith("SALES -")
                );

            const filteredReport = sectionStart === -1
                ? []
                : report.slice(
                    sectionStart,
                    nextSectionStart === -1
                        ? report.length
                        : nextSectionStart
                );

            // =================================================
            // NO DATA
            // =================================================

            if (
                !filteredReport ||
                filteredReport.length === 0
            ) {

                container.innerHTML = `

                    <p>
                        No sales recorded for ${selectedDate}.
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

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>

                    <tbody>

            `;

            // =================================================
            // LOOP FILTERED REPORT
            // =================================================

            filteredReport.forEach(row => {

                // Skip header row
                if (
                    row[0] === "DATE" &&
                    row[1] === "ITEM NAME"
                ) {

                    return;

                }

                // Skip daily total initially, show at end
                if (
                    row[1] === "DAILY TOTAL"
                ) {

                    return;

                }

                // Skip section headers
                if (
                    row[0] &&
                    row[0].startsWith("SALES -")
                ) {

                    return;

                }

                // Add normal sale rows
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

                        <td>
                            <button
                                type="button"
                                class="edit-sale-button"
                                data-date="${row[0]}"
                                data-item="${row[1]}"
                                data-price="${row[2]}"
                                data-quantity="${row[3]}"
                                style="
                                    background:#2196F3;
                                    color:#fff;
                                    border:none;
                                    padding:8px 10px;
                                    border-radius:6px;
                                    cursor:pointer;
                                    font-weight:600;
                                    margin-right:5px;
                                "
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                class="delete-sale-button"
                                data-date="${row[0]}"
                                data-item="${row[1]}"
                                style="
                                    background:#c0392b;
                                    color:#fff;
                                    border:none;
                                    padding:8px 10px;
                                    border-radius:6px;
                                    cursor:pointer;
                                    font-weight:600;
                                "
                            >
                                Delete
                            </button>
                        </td>

                    </tr>

                `;

            });

            // Add daily total at the end
            const dailyTotal = filteredReport.find(
                row => row[1] === "DAILY TOTAL"
            );

            if (dailyTotal) {

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
                                ${dailyTotal[3]}
                            </strong>
                        </td>

                        <td>
                            <strong>
                                ₹${Number(
                                    dailyTotal[4] || 0
                                ).toLocaleString("en-IN")}
                            </strong>
                        </td>

                        <td></td>

                    </tr>

                `;

            }

            html += `

                    </tbody>

                </table>

            `;

            // =================================================
            // DISPLAY REPORT
            // =================================================

            container.innerHTML =
                html;

            container
                .querySelectorAll(
                    ".delete-sale-button"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const date =
                                button.dataset.date;

                            const item =
                                button.dataset.item;

                            if (!date || !item) {

                                return;

                            }

                            const confirmed =
                                window.confirm(
                                    `Delete the sale for ${item} on ${date}?`
                                );

                            if (!confirmed) {

                                return;

                            }

                            try {

                                const response =
                                    await fetch(
                                        "/delete-sale",
                                        {
                                            method: "DELETE",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: JSON.stringify({
                                                date,
                                                item
                                            })
                                        }
                                    );

                                const result =
                                    await response.json();

                                if (!response.ok) {

                                    throw new Error(
                                        result.message ||
                                        "Unable to delete sale"
                                    );

                                }

                                alert(
                                    result.message
                                );

                                loadDailySalesReport();

                            }

                            catch (error) {

                                console.error(
                                    "DELETE SALE ERROR:",
                                    error
                                );

                                alert(
                                    error.message ||
                                    "Error deleting sale."
                                );

                            }

                        }
                    );

                });

            // =================================================
            // EDIT SALE BUTTONS
            // =================================================

            container
                .querySelectorAll(
                    ".edit-sale-button"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const date =
                                button.dataset.date;

                            const item =
                                button.dataset.item;

                            const quantity =
                                Number(
                                    button.dataset.quantity
                                );

                            if (!date || !item) {

                                return;

                            }

                            try {
                                const itemsResponse = await fetch("/items");
                                if (!itemsResponse.ok) {
                                    throw new Error("Unable to load items.");
                                }
                                const items = await itemsResponse.json();
                                const editCard = document.getElementById("saleEditCard");
                                const itemSelect = document.getElementById("saleEditItem");
                                const status = document.getElementById("saleEditStatus");

                                itemSelect.replaceChildren();
                                items.forEach(entry => {
                                    const option = document.createElement("option");
                                    option.value = entry.name;
                                    option.textContent = entry.name;
                                    itemSelect.appendChild(option);
                                });

                                editCard.dataset.originalDate = date;
                                editCard.dataset.originalItem = item;
                                document.getElementById("saleEditDate").value = date;
                                itemSelect.value = item;
                                document.getElementById("saleEditQuantity").value = quantity;
                                status.textContent = "";
                                status.className = "";
                                editCard.hidden = false;
                                editCard.scrollIntoView({ behavior: "smooth", block: "start" });
                            } catch (error) {
                                const reportStatus = document.getElementById("saleReportStatus");
                                reportStatus.textContent = error.message || "Unable to load items.";
                                reportStatus.className = "error-message";
                            }

                        }
                    );

                });

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

    async function saveDailySaleEdit() {
        const editCard = document.getElementById("saleEditCard");
        const date = document.getElementById("saleEditDate").value;
        const item = document.getElementById("saleEditItem").value;
        const quantity = Number(document.getElementById("saleEditQuantity").value);
        const status = document.getElementById("saleEditStatus");
        const parsedDate = new Date(`${date}T00:00:00.000Z`);

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== date || !item || !Number.isInteger(quantity) || quantity <= 0) {
            status.textContent = "Enter a valid date, item, and positive whole-number quantity.";
            status.className = "error-message";
            return;
        }

        const saveButton = document.getElementById("saveSaleEditButton");
        saveButton.disabled = true;
        status.textContent = "Saving sale...";
        status.className = "";

        try {
            const response = await fetch("/update-sale", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalDate: editCard.dataset.originalDate,
                    originalItem: editCard.dataset.originalItem,
                    newDate: date,
                    newItem: item,
                    newQuantity: quantity
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Unable to update sale.");

            editCard.hidden = true;
            const dateInput = document.getElementById("currentDate");
            if (dateInput) dateInput.value = date;
            const reportStatus = document.getElementById("saleReportStatus");
            reportStatus.textContent = result.message;
            reportStatus.className = "success-message";
            await loadDailySalesReport();
        } catch (error) {
            status.textContent = error.message || "Unable to update sale.";
            status.className = "error-message";
        } finally {
            saveButton.disabled = false;
        }
    }

    function closeDailySaleEditor() {
        document.getElementById("saleEditCard").hidden = true;
    }

    // =====================================================
    // LOAD DAILY SALES REPORT PAGE
    // =====================================================

    if (
        document.getElementById(
            "dailySalesReportContainer"
        )
    ) {

        // Set date input to today
        const dateInput =
            document.getElementById(
                "currentDate"
            );

        if (dateInput) {

            dateInput.value =
                new Date()
                    .toISOString()
                    .split('T')[0];

        }

        loadDailySalesReport();

    }

    // ADD NEW ITEM

