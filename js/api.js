/**
 * ==========================================================
 * Guardian KPI API
 * ==========================================================
 */

const API = {

    async get(action) {

        const res = await fetch(
            `${CONFIG.API_URL}?action=${action}`
        );

        return await res.json();

    },

    async post(action, body = {}) {

        const res = await fetch(CONFIG.API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                action,

                ...body

            })

        });

        return await res.json();

    },

    dashboard() {
        return this.get("dashboard");
    },

    anggota() {
        return this.get("anggota");
    },

    group() {
        return this.get("group");
    },

    kpi() {
        return this.get("masterKPI");
    },

    penilaian() {
        return this.get("penilaian");
    }

};
