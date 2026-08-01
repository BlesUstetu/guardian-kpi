/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/api.js
 * ==========================================================
 * REST API Client
 * Version : 3.0.0
 * ==========================================================
 */

const API = {

    BASE_URL: CONFIG.API_URL,

    /**
     * ======================================================
     * GET REQUEST
     * ======================================================
     */
    async get(action) {

        try {

            const response = await fetch(

                `${this.BASE_URL}?action=${encodeURIComponent(action)}`

            );

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }

            return await response.json();

        } catch (err) {

            console.error(err);

            return {

                success: false,

                message: err.message

            };

        }

    },

    /**
     * ======================================================
     * POST REQUEST
     * ======================================================
     */
    async post(body) {

        try {

            const response = await fetch(

                this.BASE_URL,

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(body)

                }

            );

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }

            return await response.json();

        } catch (err) {

            console.error(err);

            return {

                success: false,

                message: err.message

            };

        }

    },

    /* =====================================================
       DASHBOARD
    ====================================================== */

    getDashboard() {

        return this.get("dashboard");

    },

    /* =====================================================
       ANGGOTA
    ====================================================== */

    getAnggota() {

        return this.get("anggota");

    },

    saveAnggota(data) {

        return this.post({

            action: "saveAnggota",

            data: data

        });

    },

    updateAnggota(id, data) {

        return this.post({

            action: "updateAnggota",

            id: id,

            data: data

        });

    },

    deleteAnggota(id) {

        return this.post({

            action: "deleteAnggota",

            id: id

        });

    },

    /* =====================================================
       GROUP
    ====================================================== */

    getGroup() {

        return this.get("group");

    },

    saveGroup(data) {

        return this.post({

            action: "saveGroup",

            data: data

        });

    },

    updateGroup(id, data) {

        return this.post({

            action: "updateGroup",

            id: id,

            data: data

        });

    },

    deleteGroup(id) {

        return this.post({

            action: "deleteGroup",

            id: id

        });

    },

    /* =====================================================
       MASTER KPI
    ====================================================== */

    getMasterKPI() {

        return this.get("masterKPI");

    },

    saveMasterKPI(data) {

        return this.post({

            action: "saveMasterKPI",

            data: data

        });

    },

    updateMasterKPI(id, data) {

        return this.post({

            action: "updateMasterKPI",

            id: id,

            data: data

        });

    },

    deleteMasterKPI(id) {

        return this.post({

            action: "deleteMasterKPI",

            id: id

        });

    },

    /* =====================================================
       PENILAIAN
    ====================================================== */

    getPenilaian() {

        return this.get("penilaian");

    },

    savePenilaian(data) {

        return this.post({

            action: "savePenilaian",

            data: data

        });

    },

    deletePenilaian(id) {

        return this.post({

            action: "deletePenilaian",

            id: id

        });

    }

};
