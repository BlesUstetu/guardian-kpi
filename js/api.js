/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/api.js
 * ==========================================================
 * REST API Client
 * Author : BlesProduction
 * Version : 2.0.0
 * ==========================================================
 */

const API = {

    BASE_URL: CONFIG.API_URL,

    /**
     * ======================================================
     * REQUEST
     * ======================================================
     */
    async request(url = "", options = {}) {

        try {

            const response = await fetch(
                this.BASE_URL + url,
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    ...options
                }
            );

            const json = await response.json();

            return json;

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
     * DASHBOARD
     * ======================================================
     */

    async getDashboard() {

        return this.request("?action=dashboard");

    },

    /**
     * ======================================================
     * ANGGOTA
     * ======================================================
     */

    async getAnggota() {

        return this.request("?action=anggota");

    },

    async saveAnggota(data) {

        return this.request("", {

            method: "POST",

            body: JSON.stringify({

                action: "saveAnggota",

                data: data

            })

        });

    },

    async updateAnggota(id, data) {

        return this.request("", {

            method: "POST",

            body: JSON.stringify({

                action: "updateAnggota",

                id: id,

                data: data

            })

        });

    },

    async deleteAnggota(id) {

        return this.request("", {

            method: "POST",

            body: JSON.stringify({

                action: "deleteAnggota",

                id: id

            })

        });

    },

    /**
     * ======================================================
     * GROUP
     * ======================================================
     */

    async getGroup() {

        return this.request("?action=group");

    },

    async saveGroup(data) {

        return this.request("", {

            method: "POST",

            body: JSON.stringify({

                action: "saveGroup",

                data: data

            })

        });

    },

    async updateGroup(id, data) {

        return this.request("", {

            method: "POST",

            body: JSON.stringify({

                action: "updateGroup",

                id: id,

                data: data

            })

        });

    },

    async deleteGroup(id) {

        return this.request("", {

            method: "POST",

            body: JSON.stringify({

                action: "deleteGroup",

                id: id

            })

        });

    },

    /**
     * ======================================================
     * MASTER KPI
     * ======================================================
     */

    async getMasterKPI() {

        return this.request("?action=masterKPI");

    },

    async saveMasterKPI(data) {

        return this.request("", {

            method: "POST",

            body: JSON.stringify({

                action: "saveMasterKPI",

                data: data

            })

        });

    },

    async updateMasterKPI(id, data) {

        return this.request("", {

            method: "POST",

            body: JSON.stringify({

                action: "updateMasterKPI",

                id: id,

                data: data

            })

        });

    },

    async deleteMasterKPI(id) {

        return this.request("", {

            method: "POST",

            body: JSON.stringify({

                action: "deleteMasterKPI",

                id: id

            })

        });

    },

    /**
     * ======================================================
     * PENILAIAN
     * ======================================================
     */

    async getPenilaian() {

        return this.request("?action=penilaian");

    },

    async savePenilaian(data) {

        return this.request("", {

            method: "POST",

            body: JSON.stringify({

                action: "savePenilaian",

                data: data

            })

        });

    },

    async deletePenilaian(id) {

        return this.request("", {

            method: "POST",

            body: JSON.stringify({

                action: "deletePenilaian",

                id: id

            })

        });

    }

};
