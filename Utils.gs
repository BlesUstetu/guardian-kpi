function generateId(sheetName,prefix){

  const data=DB.getData(sheetName);

  if(data.length===0){

    return prefix+"001";

  }

  let max=0;

  data.forEach(item=>{

    const number=parseInt(

      item.id.replace(prefix,"")

    );

    if(number>max){

      max=number;

    }

  });

  return prefix+

  String(max+1).padStart(3,"0");

}
