/**
 * ==========================================================
 * Guardian KPI
 * app.js
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", init);

async function init() {

    try {

        document.getElementById("apiStatus").innerHTML =
            "🟡 Menghubungkan API...";

        const res = await API.dashboard();

        if (!res.success) {

            document.getElementById("apiStatus").innerHTML =
                "🔴 API Error";

            return;

        }

        const data = res.data;

        document.getElementById("totalAnggota").textContent =
            data.totalAnggota;

        document.getElementById("totalGroup").textContent =
            data.totalGroup;

        document.getElementById("totalKPI").textContent =
            data.totalKPI;

        document.getElementById("averageKPI").textContent =
            data.averageKPI + "%";

        document.getElementById("apiStatus").innerHTML =
            "🟢 API Connected";

        loadChart(data);

    }

    catch (err) {

        console.error(err);

        document.getElementById("apiStatus").innerHTML =
            "🔴 Gagal terhubung";

    }

}

function loadChart(data){

    const ctx =
        document.getElementById("chartKPI");

    new Chart(ctx,{

        type:"bar",

        data:{

            labels:[

                "Anggota",

                "Group",

                "KPI"

            ],

            datasets:[{

                label:"Guardian KPI",

                data:[

                    data.totalAnggota,

                    data.totalGroup,

                    data.totalKPI

                ],

                borderWidth:2,

                borderRadius:10

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{

                    labels:{

                        color:"#ffffff"

                    }

                }

            },

            scales:{

                x:{

                    ticks:{

                        color:"#ffffff"

                    }

                },

                y:{

                    beginAtZero:true,

                    ticks:{

                        color:"#ffffff"

                    }

                }

            }

        }

    });

}

function startClock(){

    setInterval(()=>{

        const now = new Date();

        document.getElementById("clock").textContent =
            now.toLocaleTimeString("id-ID");

    },1000);

}
