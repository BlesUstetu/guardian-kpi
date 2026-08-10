/**
 * ==========================================================
 * Guardian KPI Web3
 * File : AdminPin.gs
 * Version : 1.0.0
 * ==========================================================
 *
 * ADMIN PIN TANPA LOGIN
 *
 * - Tidak menggunakan localStorage sebagai sumber PIN.
 * - Hash PIN disimpan di Script Properties.
 * - PIN pertama harus dibuat dari Apps Script editor.
 * - Setelah PIN ada, perubahan PIN wajib menggunakan PIN lama.
 * - Browser hanya menyimpan status sesi sementara.
 *
 * ==========================================================
 */

const ADMIN_PIN_PROPERTY =
    "GUARDIAN_ADMIN_PIN_HASH";

const ADMIN_PIN_MIN = 4;
const ADMIN_PIN_MAX = 12;


/* ==========================================================
 * HASH PIN
 * ==========================================================
 */

function adminPinHash_(pin) {

    const bytes =
        Utilities.computeDigest(
            Utilities.DigestAlgorithm.SHA_256,
            String(pin),
            Utilities.Charset.UTF_8
        );

    return bytes
        .map(function(byte) {

            const value =
                byte < 0
                    ? byte + 256
                    : byte;

            return value
                .toString(16)
                .padStart(2, "0");

        })
        .join("");
}


/* ==========================================================
 * VALIDASI PIN
 * ==========================================================
 */

function adminPinValid_(pin) {

    return /^\d{4,12}$/.test(
        String(pin || "")
    );

}


/* ==========================================================
 * GET HASH
 * ==========================================================
 */

function adminPinGetHash_() {

    return PropertiesService
        .getScriptProperties()
        .getProperty(
            ADMIN_PIN_PROPERTY
        );

}


/* ==========================================================
 * STATUS PIN
 * ==========================================================
 */

function adminPinStatus() {

    return Utils.success(
        "Status PIN Admin berhasil diambil.",
        {
            configured:
                Boolean(
                    adminPinGetHash_()
                )
        }
    );

}


/* ==========================================================
 * VERIFY PIN
 * ==========================================================
 */

function verifyAdminPin(pin) {

    try {

        if (!adminPinValid_(pin)) {

            return Utils.error(
                "PIN Admin harus terdiri dari 4–12 digit."
            );

        }

        const storedHash =
            adminPinGetHash_();

        if (!storedHash) {

            return Utils.error(
                "PIN Admin belum dikonfigurasi. Jalankan setupAdminPin(pin) dari Apps Script."
            );

        }

        const inputHash =
            adminPinHash_(pin);

        if (
            inputHash !== storedHash
        ) {

            return Utils.error(
                "PIN Admin salah."
            );

        }

        return Utils.success(
            "PIN Admin benar.",
            {
                verified: true
            }
        );

    } catch (err) {

        return Utils.error(
            err.message
        );

    }

}


/* ==========================================================
 * SETUP PERTAMA
 *
 * Jalankan SEKALI dari Apps Script editor:
 *
 * setupAdminPin("123456");
 *
 * Ganti 123456 dengan PIN Admin Anda.
 *
 * Setelah PIN tersimpan, fungsi ini tidak dapat
 * menimpa PIN yang sudah ada.
 * ==========================================================
 */

function setupAdminPin(pin) {

    const lock =
        LockService.getScriptLock();

    try {

        lock.waitLock(15000);

        if (!adminPinValid_(pin)) {

            throw new Error(
                "PIN Admin harus 4–12 digit."
            );

        }

        if (adminPinGetHash_()) {

            throw new Error(
                "PIN Admin sudah dikonfigurasi. Gunakan changeAdminPin(pinLama, pinBaru)."
            );

        }

        PropertiesService
            .getScriptProperties()
            .setProperty(
                ADMIN_PIN_PROPERTY,
                adminPinHash_(pin)
            );

        return Utils.success(
            "PIN Admin berhasil dikonfigurasi."
        );

    } finally {

        try {

            lock.releaseLock();

        } catch (e) {}

    }

}


/* ==========================================================
 * UBAH PIN ADMIN
 *
 * Memerlukan PIN lama.
 * ==========================================================
 */

function changeAdminPin(
    oldPin,
    newPin
) {

    const lock =
        LockService.getScriptLock();

    try {

        lock.waitLock(15000);

        if (!adminPinValid_(oldPin)) {

            return Utils.error(
                "PIN lama tidak valid."
            );

        }

        if (!adminPinValid_(newPin)) {

            return Utils.error(
                "PIN baru harus 4–12 digit."
            );

        }

        const storedHash =
            adminPinGetHash_();

        if (!storedHash) {

            return Utils.error(
                "PIN Admin belum dikonfigurasi."
            );

        }

        if (
            adminPinHash_(oldPin) !==
            storedHash
        ) {

            return Utils.error(
                "PIN lama salah."
            );

        }

        PropertiesService
            .getScriptProperties()
            .setProperty(
                ADMIN_PIN_PROPERTY,
                adminPinHash_(newPin)
            );

        return Utils.success(
            "PIN Admin berhasil diubah."
        );

    } catch (err) {

        return Utils.error(
            err.message
        );

    } finally {

        try {

            lock.releaseLock();

        } catch (e) {}

    }

}


/* ==========================================================
 * RESET DARURAT
 *
 * Tidak dipanggil dari frontend.
 *
 * Gunakan hanya dari Apps Script editor jika PIN
 * benar-benar lupa.
 * ==========================================================
 */

function resetAdminPin() {

    PropertiesService
        .getScriptProperties()
        .deleteProperty(
            ADMIN_PIN_PROPERTY
        );

    return Utils.success(
        "PIN Admin telah dihapus. Jalankan setupAdminPin(pin) untuk membuat PIN baru."
    );

}

