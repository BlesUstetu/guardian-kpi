/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/laporan.js
 * Module : Laporan Penilaian
 * Version : 1.0.0
 * ==========================================================
 *
 * CATATAN:
 * - Modul ini READ ONLY.
 * - Tidak mengubah data Penilaian.
 * - Tidak mengubah API backend.
 * - Tidak mengubah Penilaian.gs.
 * - Export PDF menggunakan Print Browser.
 * - Export Sheet menggunakan CSV.
 *
 * ==========================================================
 */

"use strict";


/* ==========================================================
 * STATE
 * ==========================================================
 */

let laporanData = [];

let laporanFilteredData = [];


/* ==========================================================
 * KONSTANTA
 * ==========================================================
 */

const LAPORAN_BULAN = [

    {
        value: "",
        label: "Semua Bulan"
    },

    {
        value: "1",
        label: "Januari"
    },

    {
        value: "2",
        label: "Februari"
    },

    {
        value: "3",
        label: "Maret"
    },

    {
        value: "4",
        label: "April"
    },

    {
        value: "5",
        label: "Mei"
    },

    {
        value: "6",
        label: "Juni"
    },

    {
        value: "7",
        label: "Juli"
    },

    {
        value: "8",
        label: "Agustus"
    },

    {
        value: "9",
        label: "September"
    },

    {
        value: "10",
        label: "Oktober"
    },

    {
        value: "11",
        label: "November"
    },

    {
        value: "12",
        label: "Desember"
    }

];


/* ==========================================================
 * INITIALIZER
 * ==========================================================
 */

async function loadLaporan() {

    console.log(
        "Guardian KPI: Laporan init."
    );


    const tableBody =
        document.getElementById(
            "laporanTableBody"
        );


    if (!tableBody) {

        console.warn(
            "Laporan: table body tidak ditemukan."
        );

        return;

    }


    laporanSetupBulan();

    laporanSetupEvents();


    await laporanLoadData();

}


/* ==========================================================
 * LOAD DATA
 * ==========================================================
 */

async function laporanLoadData() {

    const tableBody =
        document.getElementById(
            "laporanTableBody"
        );


    if (!tableBody) {

        return;

    }


    laporanSetLoading(
        true
    );


    try {

        if (
            typeof API ===
            "undefined"
        ) {

            throw new Error(
                "API tidak tersedia."
            );

        }


        const response =
            await API.getPenilaian();


        console.log(
            "Laporan API Response:",
            response
        );


        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                response?.message ||
                "Data Penilaian gagal diambil."
            );

        }


        laporanData =
            Array.isArray(
                response.data
            )
                ? response.data
                : [];


        /*
         * Normalisasi data.
         */

        laporanData =
            laporanData.map(
                function(item) {

                    return {

                        id:
                            String(
                                item.id ||
                                ""
                            ).trim(),

                        anggotaId:
                            String(
                                item.anggotaId ||
                                ""
                            ).trim(),

                        namaAnggota:
                            String(
                                item.namaAnggota ||
                                ""
                            ).trim(),

                        group:
                            String(
                                item.group ||
                                ""
                            ).trim(),

                        bulan:
                            Number(
                                item.bulan ||
                                0
                            ),

                        tahun:
                            Number(
                                item.tahun ||
                                0
                            ),

                        total:
                            Number(
                                item.total ||
                                item.nilaiAkhir ||
                                0
                            ),

                        nilaiAkhir:
                            Number(
                                item.nilaiAkhir ||
                                item.total ||
                                0
                            ),

                        status:
                            String(
                                item.status ||
                                ""
                            ).trim()

                    };

                }
            );


        laporanSetupTahun();

        laporanApplyFilter();


        console.log(
            "Laporan data:",
            laporanData.length
        );


    }
    catch (err) {

        console.error(
            "Laporan load error:",
            err
        );


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-danger py-4">

                    <i class="bi bi-exclamation-triangle me-2"></i>

                    ${laporanEscape(
                        err.message
                    )}

                </td>

            </tr>

        `;

    }
    finally {

        laporanSetLoading(
            false
        );

    }

}


/* ==========================================================
 * SETUP BULAN
 * ==========================================================
 */

function laporanSetupBulan() {

    const select =
        document.getElementById(
            "laporanBulan"
        );


    if (!select) {

        return;

    }


    select.innerHTML =
        LAPORAN_BULAN
            .map(
                function(item) {

                    return `

                        <option
                            value="${item.value}">

                            ${item.label}

                        </option>

                    `;

                }
            )
            .join("");

}


/* ==========================================================
 * SETUP TAHUN
 *
 * DINAMIS DARI DATA
 * Tidak dibatasi 2028.
 * ==========================================================
 */

function laporanSetupTahun() {

    const select =
        document.getElementById(
            "laporanTahun"
        );


    if (!select) {

        return;

    }


    const years =
        [
            ...new Set(
                laporanData
                    .map(
                        function(item) {

                            return Number(
                                item.tahun
                            );

                        }
                    )
                    .filter(
                        function(year) {

                            return (
                                Number.isInteger(
                                    year
                                ) &&
                                year > 0
                            );

                        }
                    )
            )
        ]
        .sort(
            function(a, b) {

                return b - a;

            }
        );


    select.innerHTML = `

        <option value="">
            Semua Tahun
        </option>

    `;


    years.forEach(
        function(year) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(year);


            option.textContent =
                String(year);


            select.appendChild(
                option
            );

        }
    );

}


/* ==========================================================
 * SETUP EVENTS
 * ==========================================================
 */

function laporanSetupEvents() {

    const search =
        document.getElementById(
            "laporanSearch"
        );

    const bulan =
        document.getElementById(
            "laporanBulan"
        );

    const tahun =
        document.getElementById(
            "laporanTahun"
        );

    const status =
        document.getElementById(
            "laporanStatus"
        );


    search?.addEventListener(
        "input",
        laporanApplyFilter
    );


    bulan?.addEventListener(
        "change",
        laporanApplyFilter
    );


    tahun?.addEventListener(
        "change",
        laporanApplyFilter
    );


    status?.addEventListener(
        "change",
        laporanApplyFilter
    );


    document
        .getElementById(
            "btnLaporanRefresh"
        )
        ?.addEventListener(
            "click",
            function() {

                laporanLoadData();

            }
        );


    document
        .getElementById(
            "btnLaporanPDF"
        )
        ?.addEventListener(
            "click",
            laporanExportPDF
        );


    document
        .getElementById(
            "btnLaporanCSV"
        )
        ?.addEventListener(
            "click",
            laporanExportCSV
        );

}


/* ==========================================================
 * FILTER
 * ==========================================================
 */

function laporanApplyFilter() {

    const search =
        String(
            document.getElementById(
                "laporanSearch"
            )?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const bulan =
        String(
            document.getElementById(
                "laporanBulan"
            )?.value ||
            ""
        );


    const tahun =
        String(
            document.getElementById(
                "laporanTahun"
            )?.value ||
            ""
        );


    const status =
        String(
            document.getElementById(
                "laporanStatus"
            )?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    laporanFilteredData =
        laporanData.filter(
            function(item) {

                /*
                 * SEARCH
                 */

                const searchText =
                    [

                        item.id,

                        item.anggotaId,

                        item.namaAnggota,

                        item.group

                    ]
                    .join(" ")
                    .toLowerCase();


                if (
                    search &&
                    !searchText.includes(
                        search
                    )
                ) {

                    return false;

                }


                /*
                 * BULAN
                 */

                if (
                    bulan &&
                    Number(
                        item.bulan
                    ) !==
                    Number(
                        bulan
                    )
                ) {

                    return false;

                }


                /*
                 * TAHUN
                 */

                if (
                    tahun &&
                    Number(
                        item.tahun
                    ) !==
                    Number(
                        tahun
                    )
                ) {

                    return false;

                }


                /*
                 * STATUS
                 */

                if (
                    status &&
                    String(
                        item.status ||
                        ""
                    )
                    .toLowerCase() !==
                    status
                ) {

                    return false;

                }


                return true;

            }
        );


    laporanRenderTable();

    laporanUpdateSummary();

}


/* ==========================================================
 * RENDER TABLE
 * ==========================================================
 */

function laporanRenderTable() {

    const tbody =
        document.getElementById(
            "laporanTableBody"
        );


    if (!tbody) {

        return;

    }


    if (
        laporanFilteredData.length ===
        0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center py-5 text-secondary">

                    <i
                        class="bi bi-inbox fs-3 d-block mb-2">
                    </i>

                    Tidak ada data laporan.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        laporanFilteredData
            .map(
                function(item) {

                    return `

                        <tr>

                            <td>
                                ${laporanEscape(
                                    item.id
                                )}
                            </td>

                            <td>
                                ${laporanEscape(
                                    item.namaAnggota
                                )}
                            </td>

                            <td>
                                ${laporanEscape(
                                    item.group
                                )}
                            </td>

                            <td>
                                ${laporanNamaBulan(
                                    item.bulan
                                )}
                            </td>

                            <td>
                                ${laporanEscape(
                                    item.tahun
                                )}
                            </td>

                            <td>
                                <span
                                    class="laporan-nilai">

                                    ${laporanFormatNilai(
                                        item.nilaiAkhir
                                    )}

                                </span>
                            </td>

                            <td>
                                <span
                                    class="badge bg-secondary">

                                    ${laporanEscape(
                                        item.status ||
                                        "-"
                                    )}

                                </span>
                            </td>

                            <td>
                                ${laporanEscape(
                                    item.anggotaId
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


/* ==========================================================
 * SUMMARY
 * ==========================================================
 */

function laporanUpdateSummary() {

    const total =
        document.getElementById(
            "laporanTotalData"
        );


    const rata =
        document.getElementById(
            "laporanRataRata"
        );


    if (total) {

        total.textContent =
            laporanFilteredData.length;

    }


    if (rata) {

        if (
            laporanFilteredData.length ===
            0
        ) {

            rata.textContent =
                "0.00";

        }
        else {

            const sum =
                laporanFilteredData
                    .reduce(
                        function(
                            accumulator,
                            item
                        ) {

                            return (
                                accumulator +
                                Number(
                                    item.nilaiAkhir ||
                                    0
                                )
                            );

                        },
                        0
                    );


            rata.textContent =
                (
                    sum /
                    laporanFilteredData.length
                )
                .toFixed(2);

        }

    }

}


/* ==========================================================
 * EXPORT PDF
 *
 * Menggunakan Print Browser.
 * User dapat memilih:
 * Save as PDF.
 * ==========================================================
 */

function laporanExportPDF() {

    if (
        laporanFilteredData.length ===
        0
    ) {

        alert(
            "Tidak ada data untuk diekspor."
        );

        return;

    }


    const filterText =
        laporanGetFilterText();


    const rows =
        laporanFilteredData
            .map(
                function(item) {

                    return `

                        <tr>

                            <td>
                                ${laporanEscape(
                                    item.id
                                )}
                            </td>

                            <td>
                                ${laporanEscape(
                                    item.namaAnggota
                                )}
                            </td>

                            <td>
                                ${laporanEscape(
                                    item.group
                                )}
                            </td>

                            <td>
                                ${laporanNamaBulan(
                                    item.bulan
                                )}
                            </td>

                            <td>
                                ${laporanEscape(
                                    item.tahun
                                )}
                            </td>

                            <td class="nilai">
                                ${laporanFormatNilai(
                                    item.nilaiAkhir
                                )}
                            </td>

                            <td>
                                ${laporanEscape(
                                    item.status ||
                                    "-"
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Popup diblokir browser. Izinkan popup untuk export PDF."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="id">

        <head>

            <meta charset="UTF-8">

            <title>
                Laporan Penilaian KPI
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    color: #111;

                    margin: 25px;
                }

                h1 {
                    margin: 0;
                    font-size: 22px;
                }

                h2 {
                    margin:
                        4px 0 0;

                    font-size: 15px;
                    font-weight: normal;
                }

                .header {
                    border-bottom:
                        2px solid #111;

                    padding-bottom:
                        12px;

                    margin-bottom:
                        15px;
                }

                .meta {
                    margin:
                        8px 0 15px;

                    font-size:
                        12px;
                }

                table {
                    width: 100%;
                    border-collapse:
                        collapse;

                    font-size:
                        11px;
                }

                th,
                td {
                    border:
                        1px solid #888;

                    padding:
                        7px 6px;

                    text-align:
                        left;
                }

                th {
                    background:
                        #eeeeee;

                    font-weight:
                        bold;
                }

                td.nilai {
                    text-align:
                        right;

                    font-weight:
                        bold;
                }

                .summary {
                    margin-top:
                        15px;

                    font-size:
                        12px;

                    font-weight:
                        bold;
                }

                .footer {
                    margin-top:
                        30px;

                    font-size:
                        10px;

                    color:
                        #555;
                }

                @page {
                    size:
                        A4 landscape;

                    margin:
                        12mm;
                }

                @media print {

                    body {
                        margin:
                            0;
                    }

                    .no-print {
                        display:
                            none;
                    }

                }

            </style>

        </head>

        <body>

            <div class="header">

                <h1>
                    GUARDIAN KPI
                </h1>

                <h2>
                    Laporan Penilaian KPI Anggota Security
                </h2>

            </div>


            <div class="meta">

                <strong>
                    Filter:
                </strong>

                ${laporanEscape(
                    filterText
                )}

                <br>

                <strong>
                    Dicetak:
                </strong>

                ${laporanEscape(
                    new Date()
                        .toLocaleString(
                            "id-ID"
                        )
                )}

            </div>


            <table>

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Nama Anggota</th>

                        <th>Group</th>

                        <th>Bulan</th>

                        <th>Tahun</th>

                        <th>Nilai</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    ${rows}

                </tbody>

            </table>


            <div class="summary">

                Total Data:
                ${laporanFilteredData.length}

                &nbsp;&nbsp; | &nbsp;&nbsp;

                Rata-rata Nilai:
                ${laporanGetAverage()}

            </div>


            <div class="footer">

                Guardian KPI Web3 —
                Laporan Penilaian

            </div>


            <script>

                window.onload =
                    function() {

                        window.print();

                    };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();

}


/* ==========================================================
 * EXPORT CSV / SHEET
 * ==========================================================
 */

function laporanExportCSV() {

    if (
        laporanFilteredData.length ===
        0
    ) {

        alert(
            "Tidak ada data untuk diekspor."
        );

        return;

    }


    const header = [

        "ID",

        "Nama Anggota",

        "Group",

        "Bulan",

        "Tahun",

        "Nilai",

        "Status",

        "Anggota ID"

    ];


    const rows =
        laporanFilteredData
            .map(
                function(item) {

                    return [

                        item.id,

                        item.namaAnggota,

                        item.group,

                        laporanNamaBulan(
                            item.bulan
                        ),

                        item.tahun,

                        laporanFormatNilai(
                            item.nilaiAkhir
                        ),

                        item.status,

                        item.anggotaId

                    ];

                }
            );


    const csv =

        "\uFEFF" +

        [
            header,
            ...rows
        ]
        .map(
            function(row) {

                return row
                    .map(
                        laporanCSVCell
                    )
                    .join(",");

            }
        )
        .join("\r\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        laporanBuildFilename(
            "csv"
        );


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* ==========================================================
 * HELPER
 * ==========================================================
 */

function laporanGetFilterText() {

    const search =
        document.getElementById(
            "laporanSearch"
        )?.value ||
        "";


    const bulan =
        document.getElementById(
            "laporanBulan"
        );


    const tahun =
        document.getElementById(
            "laporanTahun"
        );


    const status =
        document.getElementById(
            "laporanStatus"
        );


    const bulanText =
        bulan?.selectedOptions?.[0]
            ?.textContent
            ?.trim() ||
        "Semua Bulan";


    const tahunText =
        tahun?.selectedOptions?.[0]
            ?.textContent
            ?.trim() ||
        "Semua Tahun";


    const statusText =
        status?.selectedOptions?.[0]
            ?.textContent
            ?.trim() ||
        "Semua Status";


    return [

        "Anggota: " +
            (
                search.trim() ||
                "Semua"
            ),

        "Bulan: " +
            bulanText,

        "Tahun: " +
            tahunText,

        "Status: " +
            statusText

    ]
    .join(" | ");

}


function laporanGetAverage() {

    if (
        laporanFilteredData.length ===
        0
    ) {

        return "0.00";

    }


    const total =
        laporanFilteredData
            .reduce(
                function(
                    accumulator,
                    item
                ) {

                    return (
                        accumulator +
                        Number(
                            item.nilaiAkhir ||
                            0
                        )
                    );

                },
                0
            );


    return (
        total /
        laporanFilteredData.length
    )
    .toFixed(2);

}


function laporanNamaBulan(
    bulan
) {

    const item =
        LAPORAN_BULAN.find(
            function(item) {

                return Number(
                    item.value
                ) ===
                Number(
                    bulan
                );

            }
        );


    return item
        ? item.label
        : "-";

}


function laporanFormatNilai(
    value
) {

    const number =
        Number(
            value
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return "0.00";

    }


    return number.toFixed(2);

}


function laporanCSVCell(
    value
) {

    const text =
        String(
            value ?? ""
        );


    return '"' +
        text
            .replace(
                /"/g,
                '""'
            ) +
        '"';

}


function laporanBuildFilename(
    extension
) {

    const now =
        new Date();


    const stamp =
        [

            now.getFullYear(),

            String(
                now.getMonth() + 1
            )
            .padStart(
                2,
                "0"
            ),

            String(
                now.getDate()
            )
            .padStart(
                2,
                "0"
            )

        ]
        .join("");


    return (
        "Guardian-KPI-Laporan-" +
        stamp +
        "." +
        extension
    );

}


function laporanEscape(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


function laporanSetLoading(
    loading
) {

    const refresh =
        document.getElementById(
            "btnLaporanRefresh"
        );


    if (!refresh) {

        return;

    }


    refresh.disabled =
        loading;


    if (loading) {

        refresh.innerHTML = `

            <span
                class="spinner-border spinner-border-sm me-1">
            </span>

            Memuat...

        `;

    } else {

        refresh.innerHTML = `

            <i class="bi bi-arrow-clockwise"></i>

            Refresh

        `;

    }

}


/* ==========================================================
 * GLOBAL
 * ==========================================================
 */

window.loadLaporan =
    loadLaporan;

window.laporanExportPDF =
    laporanExportPDF;

window.laporanExportCSV =
    laporanExportCSV;
