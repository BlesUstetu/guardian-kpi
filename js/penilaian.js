/**
 * ==========================================================
 * Guardian KPI Web3
 * File    : js/penilaian.js
 * Version : 5.0.0 FINAL
 * ==========================================================
 *
 * Modul Penilaian KPI
 *
 * FUNGSI:
 * - Load data penilaian
 * - Load anggota
 * - Load Master KPI
 * - Load tahun
 * - Render indikator KPI
 * - Hitung nilai
 * - Form penilaian baru
 * - Modal penilaian
 *
 * CATATAN:
 * - Menggunakan API.getAnggota()
 * - Menggunakan API.getMasterKPI()
 * - Menggunakan API.getPenilaian() jika tersedia
 * - Tidak membuat API baru
 * ==========================================================
 */

"use strict";


/* ==========================================================
 * GLOBAL STATE
 * ==========================================================
 */

let penilaianList = [];

let penilaianAnggotaList = [];

let penilaianMasterKPIList = [];

let penilaianEditId = null;


/* ==========================================================
 * CONFIG
 * ==========================================================
 */

const PENILAIAN_CONFIG = {

    apiWaitTimeout: 15000,

    apiRetryInterval: 250,

    minNilai: 0,

    maxNilai: 100

};


/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initPenilaian() {

    console.log(
        "=========================================="
    );

    console.log(
        "Guardian KPI Penilaian 5.0.0 FINAL"
    );

    console.log(
        "initPenilaian()"
    );


    try {

        /*
         * Pastikan API tersedia terlebih dahulu.
         */
        await waitForPenilaianAPI();


        /*
         * Reset form.
         */
        clearPenilaianForm();


        /*
         * Tahun.
         */
        loadPenilaianTahun();


        /*
         * ==================================================
         * PENTING
         * ==================================================
         *
         * Anggota dimuat terlebih dahulu.
         *
         * Ini menghindari masalah dropdown kosong
         * akibat API / DOM belum siap.
         */
        await loadPenilaianAnggota();


        /*
         * Setelah anggota selesai,
         * load Master KPI dan data penilaian.
         */
        await Promise.all([
            loadPenilaianMasterKPI(),
            loadPenilaianData()
        ]);


        console.log(
            "initPenilaian() selesai."
        );

        console.log(
            "Jumlah anggota:",
            penilaianAnggotaList.length
        );

        console.log(
            "Jumlah Master KPI:",
            penilaianMasterKPIList.length
        );

    }

    catch (error) {

        console.error(
            "initPenilaian() ERROR:",
            error
        );

    }

}


/* ==========================================================
 * WAIT FOR API
 * ==========================================================
 */

function waitForPenilaianAPI() {

    return new Promise(
        function(resolve, reject) {

            const started =
                Date.now();


            function checkAPI() {

                /*
                 * API tersedia.
                 */
                if (
                    window.API &&
                    typeof window.API.getAnggota ===
                    "function"
                ) {

                    resolve(
                        window.API
                    );

                    return;

                }


                /*
                 * Timeout.
                 */
                if (
                    Date.now() -
                    started >=
                    PENILAIAN_CONFIG.apiWaitTimeout
                ) {

                    reject(
                        new Error(
                            "API.getAnggota tidak tersedia setelah menunggu " +
                            (
                                PENILAIAN_CONFIG.apiWaitTimeout /
                                1000
                            ) +
                            " detik."
                        )
                    );

                    return;

                }


                /*
                 * Coba lagi.
                 */
                setTimeout(
                    checkAPI,
                    PENILAIAN_CONFIG.apiRetryInterval
                );

            }


            checkAPI();

        }
    );

}


/* ==========================================================
 * LOAD DATA PENILAIAN
 * ==========================================================
 */

async function loadPenilaianData() {

    const tbody =
        document.getElementById(
            "tblPenilaian"
        );


    if (!tbody) {

        console.warn(
            "Element #tblPenilaian tidak ditemukan."
        );

        return;

    }


    tbody.innerHTML = `
        <tr>
            <td
                colspan="8"
                class="text-center">
                Memuat data...
            </td>
        </tr>
    `;


    try {

        /*
         * Backend mungkin belum memiliki
         * getPenilaian().
         */
        if (
            typeof API.getPenilaian !==
            "function"
        ) {

            console.warn(
                "API.getPenilaian belum tersedia."
            );

            penilaianList = [];

            renderPenilaianTable(
                []
            );

            return;

        }


        const result =
            await API.getPenilaian();


        console.log(
            "API.getPenilaian():",
            result
        );


        if (
            !result
        ) {

            throw new Error(
                "Response API penilaian kosong."
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil data penilaian."
            );

        }


        let data =
            result.data;


        /*
         * Support nested response.
         */
        if (
            data &&
            !Array.isArray(data) &&
            Array.isArray(data.data)
        ) {

            data =
                data.data;

        }


        if (
            !Array.isArray(data)
        ) {

            data = [];

        }


        penilaianList =
            data;


        renderPenilaianTable(
            penilaianList
        );

    }

    catch (error) {

        console.error(
            "loadPenilaianData ERROR:",
            error
        );


        penilaianList = [];


        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="text-danger text-center">
                    ${escapePenilaianHTML(
                        error.message
                    )}
                </td>
            </tr>
        `;

    }

}


/* ==========================================================
 * LOAD ANGGOTA
 * ==========================================================
 *
 * INI BAGIAN UTAMA PERBAIKAN DROPDOWN.
 * ==========================================================
 */

async function loadPenilaianAnggota() {

    const select =
        document.getElementById(
            "anggotaPenilaian"
        );


    /*
     * Karena penilaian.html dimuat secara
     * dinamis, pastikan element sudah ada.
     */
    if (!select) {

        console.error(
            "Element #anggotaPenilaian tidak ditemukan."
        );

        return;

    }


    /*
     * Tampilkan loading.
     */
    select.disabled = true;

    select.innerHTML = `
        <option value="">
            Memuat anggota...
        </option>
    `;


    try {

        /*
         * Pastikan API tersedia.
         */
        if (
            typeof window.API ===
            "undefined"
        ) {

            throw new Error(
                "Objek API belum tersedia."
            );

        }


        if (
            typeof API.getAnggota !==
            "function"
        ) {

            throw new Error(
                "API.getAnggota tidak tersedia."
            );

        }


        console.log(
            "Memuat data anggota..."
        );


        /*
         * Ambil data anggota.
         */
        const result =
            await API.getAnggota();


        console.log(
            "API.getAnggota():",
            result
        );


        /*
         * Validasi response.
         */
        if (
            !result
        ) {

            throw new Error(
                "Response API anggota kosong."
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil data anggota."
            );

        }


        /*
         * Ambil data.
         */
        let data =
            result.data;


        /*
         * Support response nested.
         *
         * Contoh:
         *
         * {
         *   success: true,
         *   data: {
         *      data: [...]
         *   }
         * }
         */
        if (
            data &&
            !Array.isArray(data) &&
            Array.isArray(data.data)
        ) {

            data =
                data.data;

        }


        /*
         * Pastikan array.
         */
        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Format data anggota tidak valid."
            );

        }


        /*
         * Simpan state.
         */
        penilaianAnggotaList =
            data;


        console.log(
            "Jumlah anggota:",
            penilaianAnggotaList.length
        );


        /*
         * Reset dropdown.
         */
        select.innerHTML = "";


        /*
         * Option default.
         */
        const defaultOption =
            document.createElement(
                "option"
            );


        defaultOption.value =
            "";


        defaultOption.textContent =
            "Pilih Anggota";


        select.appendChild(
            defaultOption
        );


        /*
         * Jika tidak ada data.
         */
        if (
            penilaianAnggotaList.length === 0
        ) {

            const emptyOption =
                document.createElement(
                    "option"
                );


            emptyOption.value =
                "";


            emptyOption.textContent =
                "Tidak ada anggota";


            select.appendChild(
                emptyOption
            );


            select.disabled =
                true;


            console.warn(
                "Data anggota kosong."
            );


            return;

        }


        /*
         * ==================================================
         * ISI DROPDOWN
         * ==================================================
         */
        penilaianAnggotaList.forEach(
            function(item) {

                /*
                 * Abaikan data tidak valid.
                 */
                if (
                    !item ||
                    item.id === undefined ||
                    item.id === null
                ) {

                    return;

                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(
                        item.id
                    );


                /*
                 * Format:
                 *
                 * S004 — BLES
                 */
                option.textContent =
                    String(
                        item.id
                    ) +
                    " — " +
                    String(
                        item.nama ||
                        "-"
                    );


                /*
                 * Simpan data tambahan.
                 */
                option.dataset.nama =
                    String(
                        item.nama ||
                        ""
                    );


                option.dataset.jabatan =
                    String(
                        item.jabatan ||
                        ""
                    );


                option.dataset.group =
                    String(
                        item.group ||
                        ""
                    );


                select.appendChild(
                    option
                );

            }
        );


        /*
         * Aktifkan dropdown.
         */
        select.disabled =
            false;


        console.log(
            "Dropdown anggota berhasil diisi."
        );


        console.log(
            "Jumlah option:",
            select.options.length
        );


        /*
         * Debug isi dropdown.
         */
        console.table(
            penilaianAnggotaList
        );

    }

    catch (error) {

        console.error(
            "loadPenilaianAnggota ERROR:",
            error
        );


        /*
         * Jangan gunakan alert terus-menerus.
         * Tampilkan status langsung pada dropdown.
         */
        select.innerHTML = `
            <option value="">
                Gagal memuat anggota
            </option>
        `;


        select.disabled =
            true;

    }

}


/* ==========================================================
 * LOAD TAHUN
 * ==========================================================
 */

function loadPenilaianTahun() {

    const select =
        document.getElementById(
            "tahunPenilaian"
        );


    if (!select) {

        return;

    }


    const tahun =
        new Date().getFullYear();


    select.innerHTML =
        "";


    for (
        let i = tahun - 2;
        i <= tahun + 2;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            String(i);


        option.textContent =
            String(i);


        if (
            i === tahun
        ) {

            option.selected =
                true;

        }


        select.appendChild(
            option
        );

    }

}


/* ==========================================================
 * LOAD MASTER KPI
 * ==========================================================
 */

async function loadPenilaianMasterKPI() {

    try {

        if (
            typeof API.getMasterKPI !==
            "function"
        ) {

            console.warn(
                "API.getMasterKPI belum tersedia."
            );

            penilaianMasterKPIList =
                [];

            renderPenilaianIndikator();

            return;

        }


        const result =
            await API.getMasterKPI();


        console.log(
            "API.getMasterKPI():",
            result
        );


        if (
            !result
        ) {

            throw new Error(
                "Response Master KPI kosong."
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil Master KPI."
            );

        }


        let data =
            result.data;


        /*
         * Support nested response.
         */
        if (
            data &&
            !Array.isArray(data) &&
            Array.isArray(data.data)
        ) {

            data =
                data.data;

        }


        if (
            !Array.isArray(data)
        ) {

            data = [];

        }


        /*
         * Hanya Master KPI aktif.
         */
        penilaianMasterKPIList =
            data.filter(
                function(item) {

                    return String(
                        item.status ||
                        ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    "aktif";

                }
            );


        console.log(
            "Master KPI aktif:",
            penilaianMasterKPIList
        );


        renderPenilaianIndikator();

    }

    catch (error) {

        console.error(
            "loadPenilaianMasterKPI ERROR:",
            error
        );


        penilaianMasterKPIList =
            [];


        renderPenilaianIndikator();

    }

}


/* ==========================================================
 * RENDER TABLE PENILAIAN
 * ==========================================================
 */

function renderPenilaianTable(
    data
) {

    const tbody =
        document.getElementById(
            "tblPenilaian"
        );


    if (!tbody) {

        return;

    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="text-center">
                    Belum ada data Penilaian.
                </td>
            </tr>
        `;

        return;

    }


    /*
     * Untuk sementara pertahankan struktur
     * table yang sudah ada.
     */
    tbody.innerHTML = `
        <tr>
            <td
                colspan="8"
                class="text-center">
                Data penilaian tersedia.
            </td>
        </tr>
    `;

}


/* ==========================================================
 * RENDER INDIKATOR KPI
 * ==========================================================
 */

function renderPenilaianIndikator() {

    const container =
        document.getElementById(
            "listIndikator"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(
            penilaianMasterKPIList
        ) ||
        penilaianMasterKPIList.length === 0
    ) {

        container.innerHTML = `
            <div
                class="text-center text-secondary py-3">
                Tidak ada Master KPI aktif.
            </div>
        `;

        hitungNilaiPenilaian();

        return;

    }


    let html =
        "";


    penilaianMasterKPIList.forEach(
        function(item) {

            const id =
                escapePenilaianHTML(
                    item.id
                );


            const indicator =
                escapePenilaianHTML(
                    item.indicator ||
                    item.nama ||
                    "-"
                );


            const kategori =
                escapePenilaianHTML(
                    item.kategori ||
                    "-"
                );


            const bobot =
                Number(
                    item.bobot || 0
                );


            html += `

                <div
                    class="row mb-3 align-items-center border-bottom pb-2">

                    <div class="col-md-5">

                        <strong>
                            ${indicator}
                        </strong>

                        <br>

                        <small
                            class="text-info">
                            ${kategori}
                        </small>

                    </div>


                    <div
                        class="col-md-2 text-center">

                        <span
                            class="badge bg-info">

                            ${bobot}%

                        </span>

                    </div>


                    <div
                        class="col-md-5">

                        <input
                            type="number"
                            class="form-control nilaiKPI"
                            data-id="${id}"
                            data-bobot="${bobot}"
                            min="${PENILAIAN_CONFIG.minNilai}"
                            max="${PENILAIAN_CONFIG.maxNilai}"
                            value="100"
                            oninput="hitungNilaiPenilaian()"
                        >

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;


    /*
     * Hitung nilai setelah render.
     */
    hitungNilaiPenilaian();

}


/* ==========================================================
 * HITUNG NILAI
 * ==========================================================
 */

function hitungNilaiPenilaian() {

    const inputs =
        document.querySelectorAll(
            "#listIndikator .nilaiKPI"
        );


    let total =
        0;


    inputs.forEach(
        function(input) {

            let nilai =
                Number(
                    input.value
                );


            let bobot =
                Number(
                    input.dataset.bobot
                );


            if (
                !Number.isFinite(
                    nilai
                )
            ) {

                nilai =
                    0;

            }


            if (
                !Number.isFinite(
                    bobot
                )
            ) {

                bobot =
                    0;

            }


            /*
             * Batasi nilai 0-100.
             */
            if (
                nilai <
                PENILAIAN_CONFIG.minNilai
            ) {

                nilai =
                    PENILAIAN_CONFIG.minNilai;

            }


            if (
                nilai >
                PENILAIAN_CONFIG.maxNilai
            ) {

                nilai =
                    PENILAIAN_CONFIG.maxNilai;

            }


            total +=
                nilai *
                bobot /
                100;

        }
    );


    const totalElement =
        document.getElementById(
            "totalNilai"
        );


    const akhirElement =
        document.getElementById(
            "nilaiAkhir"
        );


    const hasil =
        total.toFixed(2);


    if (
        totalElement
    ) {

        totalElement.value =
            hasil;

    }


    if (
        akhirElement
    ) {

        akhirElement.value =
            hasil;

    }


    return total;

}


/* ==========================================================
 * CLEAR FORM
 * ==========================================================
 */

function clearPenilaianForm() {

    penilaianEditId =
        null;


    /*
     * Anggota.
     */
    const anggota =
        document.getElementById(
            "anggotaPenilaian"
        );


    if (anggota) {

        /*
         * Jangan menghapus option anggota.
         *
         * Ini penting.
         *
         * Sebelumnya clear form hanya boleh
         * reset value, bukan mengosongkan
         * dropdown.
         */
        anggota.value =
            "";

    }


    /*
     * Bulan.
     */
    const bulan =
        document.getElementById(
            "bulanPenilaian"
        );


    if (bulan) {

        bulan.selectedIndex =
            0;

    }


    /*
     * Tahun.
     */
    loadPenilaianTahun();


    /*
     * Status.
     */
    const status =
        document.getElementById(
            "statusPenilaian"
        );


    if (status) {

        status.value =
            "Draft";

    }


    /*
     * Total.
     */
    const total =
        document.getElementById(
            "totalNilai"
        );


    if (total) {

        total.value =
            "";

    }


    /*
     * Nilai akhir.
     */
    const akhir =
        document.getElementById(
            "nilaiAkhir"
        );


    if (akhir) {

        akhir.value =
            "";

    }

}


/* ==========================================================
 * OPEN MODAL
 * ==========================================================
 */

async function openPenilaianModal() {

    console.log(
        "Membuka modal Penilaian Baru..."
    );


    /*
     * Pastikan anggota sudah ada.
     */
    const anggotaSelect =
        document.getElementById(
            "anggotaPenilaian"
        );


    if (
        anggotaSelect &&
        anggotaSelect.options.length <= 1
    ) {

        console.log(
            "Dropdown anggota kosong. Memuat ulang..."
        );


        await loadPenilaianAnggota();

    }


    /*
     * Reset form.
     */
    clearPenilaianForm();


    /*
     * Render KPI.
     */
    renderPenilaianIndikator();


    /*
     * Hitung.
     */
    hitungNilaiPenilaian();


    /*
     * Judul.
     */
    const title =
        document.querySelector(
            "#penilaianModal .modal-title"
        );


    if (title) {

        title.textContent =
            "Penilaian Baru";

    }


    /*
     * Modal element.
     */
    const element =
        document.getElementById(
            "penilaianModal"
        );


    if (!element) {

        console.error(
            "Element #penilaianModal tidak ditemukan."
        );

        return;

    }


    /*
     * Bootstrap.
     */
    if (
        typeof bootstrap ===
        "undefined"
    ) {

        console.error(
            "Bootstrap tidak tersedia."
        );

        return;

    }


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            element
        );


    modal.show();


    /*
     * Pastikan dropdown tetap terisi
     * setelah modal tampil.
     */
    if (
        anggotaSelect
    ) {

        console.log(
            "Dropdown anggota setelah modal:",
            anggotaSelect.options.length
        );

    }

}


/* ==========================================================
 * CLOSE MODAL
 * ==========================================================
 */

function closePenilaianModal() {

    const element =
        document.getElementById(
            "penilaianModal"
        );


    if (!element) {

        return;

    }


    if (
        typeof bootstrap ===
        "undefined"
    ) {

        return;

    }


    const modal =
        bootstrap.Modal.getInstance(
            element
        );


    if (modal) {

        modal.hide();

    }

}


/* ==========================================================
 * SAVE PENILAIAN
 * ==========================================================
 *
 * HTML penilaian.html saat ini memanggil:
 *
 * onclick="savePenilaian()"
 *
 * Namun pada source penilaian.js lama fungsi ini
 * belum tersedia.
 *
 * Kita buat handler aman:
 *
 * - validasi form
 * - jika API.savePenilaian tersedia,
 *   gunakan API tersebut
 * - jika belum tersedia,
 *   tampilkan informasi yang jelas
 *
 * Tidak membuat kontrak backend baru.
 * ==========================================================
 */

async function savePenilaian() {

    console.log(
        "savePenilaian()"
    );


    /*
     * Ambil form.
     */
    const anggota =
        document.getElementById(
            "anggotaPenilaian"
        );


    const bulan =
        document.getElementById(
            "bulanPenilaian"
        );


    const tahun =
        document.getElementById(
            "tahunPenilaian"
        );


    const status =
        document.getElementById(
            "statusPenilaian"
        );


    const total =
        document.getElementById(
            "totalNilai"
        );


    const akhir =
        document.getElementById(
            "nilaiAkhir"
        );


    /*
     * Validasi anggota.
     */
    if (
        !anggota ||
        !anggota.value
    ) {

        alert(
            "Silakan pilih anggota terlebih dahulu."
        );

        if (anggota) {

            anggota.focus();

        }

        return;

    }


    /*
     * Validasi tahun.
     */
    if (
        !tahun ||
        !tahun.value
    ) {

        alert(
            "Tahun penilaian belum dipilih."
        );

        return;

    }


    /*
     * Ambil nilai KPI.
     */
    const nilaiKPI =
        [];


    document
        .querySelectorAll(
            "#listIndikator .nilaiKPI"
        )
        .forEach(
            function(input) {

                nilaiKPI.push({

                    id:
                        input.dataset.id,

                    nilai:
                        Number(
                            input.value || 0
                        ),

                    bobot:
                        Number(
                            input.dataset.bobot || 0
                        )

                });

            }
        );


    /*
     * Payload frontend.
     */
    const payload = {

        id:
            penilaianEditId,

        anggotaId:
            anggota.value,

        bulan:
            bulan
                ? bulan.value
                : "",

        tahun:
            tahun.value,

        totalNilai:
            total
                ? Number(
                    total.value || 0
                )
                : 0,

        nilaiAkhir:
            akhir
                ? Number(
                    akhir.value || 0
                )
                : 0,

        status:
            status
                ? status.value
                : "Draft",

        indikator:
            nilaiKPI

    };


    console.log(
        "Payload Penilaian:",
        payload
    );


    /*
     * Jangan mengarang API backend.
     *
     * Jika API.savePenilaian memang ada,
     * gunakan.
     */
    if (
        typeof API.savePenilaian !==
        "function"
    ) {

        alert(
            "Form Penilaian sudah siap, tetapi API.savePenilaian belum tersedia pada backend."
        );

        console.warn(
            "API.savePenilaian belum tersedia."
        );

        return;

    }


    try {

        const result =
            await API.savePenilaian(
                payload
            );


        console.log(
            "API.savePenilaian():",
            result
        );


        if (
            !result
        ) {

            throw new Error(
                "Response API kosong."
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Gagal menyimpan penilaian."
            );

        }


        alert(
            result.message ||
            "Penilaian berhasil disimpan."
        );


        /*
         * Tutup modal.
         */
        closePenilaianModal();


        /*
         * Refresh data.
         */
        await loadPenilaianData();

    }

    catch (error) {

        console.error(
            "savePenilaian ERROR:",
            error
        );


        alert(
            error.message ||
            "Gagal menyimpan penilaian."
        );

    }

}


/* ==========================================================
 * REFRESH PENILAIAN
 * ==========================================================
 */

async function refreshPenilaian() {

    console.log(
        "Refresh Penilaian..."
    );


    await loadPenilaianAnggota();

    await loadPenilaianMasterKPI();

    await loadPenilaianData();

}


/* ==========================================================
 * FILTER PENILAIAN
 * ==========================================================
 *
 * Fungsi ini dibuat aman karena HTML saat ini
 * memanggil filterPenilaian().
 * ==========================================================
 */

function filterPenilaian() {

    const filterTahun =
        document.getElementById(
            "filterTahun"
        );


    const filterStatus =
        document.getElementById(
            "filterStatusPenilaian"
        );


    const tahun =
        filterTahun
            ? String(
                filterTahun.value
            )
            : "";


    const status =
        filterStatus
            ? String(
                filterStatus.value
            )
            : "";


    let data =
        Array.isArray(
            penilaianList
        )
        ? penilaianList.slice()
        : [];


    /*
     * Filter tahun.
     */
    if (tahun) {

        data =
            data.filter(
                function(item) {

                    return String(
                        item.tahun ||
                        item.year ||
                        ""
                    ) === tahun;

                }
            );

    }


    /*
     * Filter status.
     */
    if (status) {

        data =
            data.filter(
                function(item) {

                    return String(
                        item.status ||
                        ""
                    )
                    .toLowerCase()
                    ===
                    status.toLowerCase();

                }
            );

    }


    renderPenilaianTable(
        data
    );

}


/* ==========================================================
 * ESCAPE HTML
 * ==========================================================
 */

function escapePenilaianHTML(
    value
) {

    return String(
        value === undefined ||
        value === null
            ? ""
            : value
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


/* ==========================================================
 * EXPORT GLOBAL
 * ==========================================================
 */

window.initPenilaian =
    initPenilaian;


window.loadPenilaianData =
    loadPenilaianData;


window.loadPenilaianAnggota =
    loadPenilaianAnggota;


window.loadPenilaianMasterKPI =
    loadPenilaianMasterKPI;


window.loadPenilaianTahun =
    loadPenilaianTahun;


window.renderPenilaianTable =
    renderPenilaianTable;


window.renderPenilaianIndikator =
    renderPenilaianIndikator;


window.hitungNilaiPenilaian =
    hitungNilaiPenilaian;


window.openPenilaianModal =
    openPenilaianModal;


window.closePenilaianModal =
    closePenilaianModal;


window.clearPenilaianForm =
    clearPenilaianForm;


window.savePenilaian =
    savePenilaian;


window.refreshPenilaian =
    refreshPenilaian;


window.filterPenilaian =
    filterPenilaian;


/* ==========================================================
 * END
 * ==========================================================
 */

console.log(
    "Guardian KPI penilaian.js 5.0.0 FINAL loaded."
);
