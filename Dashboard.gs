function getDashboard(){

  const anggota=DB.getData(CONFIG.SHEET.ANGGOTA);

  const group=DB.getData(CONFIG.SHEET.GROUP);

  const master=DB.getData(CONFIG.SHEET.KPI);

  const penilaian=DB.getData(CONFIG.SHEET.PENILAIAN);

  let average=0;

  if(penilaian.length){

    let total=0;

    penilaian.forEach(item=>{

      total+=Number(item.nilai||0);

    });

    average=(total/penilaian.length).toFixed(2);

  }

  return{

    totalAnggota:anggota.length,

    totalGroup:group.length,

    totalKPI:master.length,

    averageKPI:average

  };

}
