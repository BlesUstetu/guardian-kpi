/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/api.js
 * ==========================================================
 * REST API Client
 * Author  : BlesProduction
 * Version : 3.1.0
 * ==========================================================
 */

"use strict";

const API = {

    BASE_URL: CONFIG.API_URL,

    /* ======================================================
     * REQUEST (GET)
     * ====================================================== */

    async request(url = "", options = {}) {

        try {

            console.log("================================");
            console.log("API REQUEST :", this.BASE_URL + url);
            console.log("OPTIONS :", options);

            const response = await fetch(

                this.BASE_URL + url,

                options

            );

            console.log("STATUS :", response.status);
            console.log("URL FINAL :", response.url);

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }

            const json = await response.json();

            console.log("POST RESPONSE :", json);

            return json;

        }

        catch (err) {

            console.error(err);

            return {

                success: false,

                message: err.message

            };

        }

    },

    /* ======================================================
     * GET
     * ====================================================== */

    async get(action) {

        return this.request(

            `?action=${encodeURIComponent(action)}`

        );

    },

    /* ======================================================
     * POST
     * ====================================================== */

    async post(body = {}) {

        try {

            console.log("========== POST ==========");
            console.log("URL :", this.BASE_URL);
            console.log("BODY :", body);

            const form = new URLSearchParams();

            form.append(

                "payload",

                JSON.stringify(body)

            );

            const response = await fetch(

                this.BASE_URL,

                {

                    method: "POST",

                    body: form

                }

            );

            console.log("POST STATUS :", response.status);
            console.log("POST URL :", response.url);

            if (!response.ok) {

                throw new Error(

                    `HTTP ${response.status}`

                );

            }

            return await response.json();

        }

        catch (err) {

            console.error(err);

            return {

                success: false,

                message: err.message

            };

        }

    },

        /* ======================================================
     * DASHBOARD
     * ====================================================== */

    async getDashboard() {

        return this.get("dashboard");

    },

    /* ======================================================
     * ANGGOTA
     * ====================================================== */

    async getAnggota() {

        return this.get("anggota");

    },

    async getAnggotaById(id) {

        return this.get(

            "anggota&id=" +
            encodeURIComponent(id)

        );

    },

    async saveAnggota(data) {

        return this.post({

            action: "saveAnggota",

            data: data

        });

    },

    async updateAnggota(id, data) {

        return this.post({

            action: "updateAnggota",

            id: id,

            data: data

        });

    },

    async deleteAnggota(id) {

        return this.post({

            action: "deleteAnggota",

            id: id

        });

    },

        /* ======================================================
     * GROUP
     * ====================================================== */

    async getGroup() {

        return this.get("group");

    },

    async getGroupById(id) {

        return this.get(

            "group&id=" +
            encodeURIComponent(id)

        );

    },

    async saveGroup(data) {

        return this.post({

            action: "saveGroup",

            data: data

        });

    },

    async updateGroup(id, data) {

        return this.post({

            action: "updateGroup",

            id: id,

            data: data

        });

    },

    async deleteGroup(id) {

        return this.post({

            action: "deleteGroup",

            id: id

        });

    },

    /* ======================================================
     * MASTER KPI
     * ====================================================== */

    async getMasterKPI() {

        return this.get("masterKPI");

    },

    async getMasterKPIById(id) {

        return this.get(

            "masterKPI&id=" +
            encodeURIComponent(id)

        );

    },

    async saveMasterKPI(data) {

        return this.post({

            action: "saveMasterKPI",

            data: data

        });

    },

    async updateMasterKPI(id, data) {

        return this.post({

            action: "updateMasterKPI",

            id: id,

            data: data

        });

    },

    async deleteMasterKPI(id) {

        return this.post({

            action: "deleteMasterKPI",

            id: id

        });

    },

        /* ======================================================
     * PENILAIAN
     * ====================================================== */

    async getPenilaian() {

        return this.get("penilaian");

    },

    async getPenilaianById(id) {

        return this.get(

            "penilaian&id=" +
            encodeURIComponent(id)

        );

    },

    async savePenilaian(data) {

        return this.post({

            action: "savePenilaian",

            data: data

        });

    },

    async updatePenilaian(id, data) {

        return this.post({

            action: "updatePenilaian",

            id: id,

            data: data

        });

    },

    async deletePenilaian(id) {

        return this.post({

            action: "deletePenilaian",

            id: id

        });

    }

};

/* ==========================================================
 * LOCK OBJECT
 * ==========================================================
 */

Object.freeze(API);
