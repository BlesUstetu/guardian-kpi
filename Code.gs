/**
 * ==========================================================
 * Guardian KPI Web3
 * File : Code.gs
 * Version : 2.1.0 Production
 * ==========================================================
 */

"use strict";

/* ==========================================================
 * GET ROUTER
 * ==========================================================
 */

function doGet(e){

  try{

    const action =
      String(
        e.parameter.action || ""
      ).trim();

    let result;

    switch(action){

      /* ===============================
       * DASHBOARD
       * =============================== */

      case "dashboard":

        result =
          Utils.success(

            "Dashboard berhasil diambil.",

            getDashboard()

          );

        break;

      /* ===============================
       * ANGGOTA
       * =============================== */

      case "anggota":

        result =
          Utils.success(

            "Data anggota berhasil diambil.",

            getAnggota()

          );

        break;

      /* ===============================
       * GROUP
       * =============================== */

      case "group":

        result =
          Utils.success(

            "Data group berhasil diambil.",

            getGroup()

          );

        break;

      /* ===============================
       * MASTER KPI
       * =============================== */

      case "masterKPI":

        result =
          Utils.success(

            "Data Master KPI berhasil diambil.",

            getMasterKPI()

          );

        break;

      /* ===============================
       * PENILAIAN
       * =============================== */

      case "penilaian":

        result =
          getPenilaian();

        break;

      /* ===============================
       * DEFAULT
       * =============================== */

      default:

        result={

          success:true,

          app:CONFIG.APP_NAME,

          version:CONFIG.VERSION,

          message:"Guardian KPI REST API"

        };

    }

    return output(result);

  }

  catch(err){

    return output(

      Utils.error(

        err.message

      )

    );

  }

}

/* ==========================================================
 * POST ROUTER
 * ==========================================================
 */

function doPost(e){

  try{

    const body = JSON.parse(

      e.parameter.payload || "{}"

    );

    const action =
      body.action || "";

    const data =
      body.data || {};

    let result;

    switch(action){

      /* ===============================
       * ANGGOTA
       * =============================== */

      case "saveAnggota":

        result =
          saveAnggota(data);

        break;

      case "updateAnggota":

        result =
          updateAnggota(

            body.id,

            data

          );

        break;

      case "deleteAnggota":

        result =
          deleteAnggota(

            body.id

          );

        break;

      /* ===============================
       * GROUP
       * =============================== */

      case "saveGroup":

        result =
          saveGroup(data);

        break;

      case "updateGroup":

        result =
          updateGroup(

            body.id,

            data

          );

        break;

      case "deleteGroup":

        result =
          deleteGroup(

            body.id

          );

        break;

      /* ===============================
       * MASTER KPI
       * =============================== */

      case "saveMasterKPI":

        result =
          saveMasterKPI(data);

        break;

      case "updateMasterKPI":

        result =
          updateMasterKPI(

            body.id,

            data

          );

        break;

      case "deleteMasterKPI":

        result =
          deleteMasterKPI(

            body.id

          );

        break;

      /* ===============================
       * PENILAIAN
       * =============================== */

      case "savePenilaian":

        result =
          savePenilaian(data);

        break;

      case "updatePenilaian":

        result =
          updatePenilaian(

            body.id,

            data

          );

        break;

      case "deletePenilaian":

        result =
          deletePenilaian(

            body.id

          );

        break;
      
      /* ===============================
       * ADMIN PIN
       * =============================== */

      case "verifyAdminPin":

      result =
          verifyAdminPin(
              body.pin
          );

      break;


      case "adminPinStatus":

      result =
          adminPinStatus();

      break;


      case "changeAdminPin":

      result =
          changeAdminPin(

              body.oldPin,

              body.newPin

          );

      break;

      /* ===============================
       * UNKNOWN
       * =============================== */

      default:

        result =
          Utils.error(

            "Action tidak ditemukan."

          );

    }

    return output(result);

  }

  catch(err){

    return output(

      Utils.error(

        err.message

      )

    );

  }

}

/* ==========================================================
 * JSON OUTPUT
 * ==========================================================
 */

function output(data){

  return ContentService

    .createTextOutput(

      JSON.stringify(data)

    )

    .setMimeType(

      ContentService.MimeType.JSON

    );

}
