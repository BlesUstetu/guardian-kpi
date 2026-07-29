/**
 * ==========================================
 * Dashboard.gs
 * ==========================================
 */

function getDashboard() {

  const anggota = DB.getData(CONFIG.SHEET.ANGGOTA);
  const groups = DB.getData(CONFIG.SHEET.GROUP);
  const kpi = DB.getData(CONFIG.SHEET.KPI);
  const penilaian = DB.getData(CONFIG.SHEET.PENILAIAN);

  let average = 0;

  if (penilaian.length > 0) {

    let total = 0;

    penilaian.forEach(item => {

      total += Number(item.actual || 0);

    });

    average = (total / penilaian.length).toFixed(2);

  }

  return {

    totalAnggota: anggota.length,

    totalGroup: groups.length,

    totalKPI: kpi.length,

    averageKPI: average

  };

}
