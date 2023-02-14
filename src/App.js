import './App.css';
import Axios from "axios"
import { useEffect, useState} from 'react'
import * as XLXS from "xlsx"
import ExcelJs from "exceljs";

function App() {
  const [token, setToken] = useState("");
  const [tagfinish,setTagFinish] = useState(Boolean);//是否全部獲取完畢
  const [oldUrlView, setOldUrlView] = useState([]);
  const [newUrlView ,setNewUrlView] = useState([]);
  const [upLoadFile, setUpLoadFile] = useState("");
  const [fileNameView, setFileNameView] = useState(null);//excel文件
  const [finishView,setFinishView] = useState(Boolean);//是否全部獲取完畢
  const [encodeIDView, setEncodeIDView] = useState([])//encodeID
  const [tagid, setTagID] = useState([]);
 

  //點擊次數
  const [totalClicks, setTotalClicks] = useState([]);
  const [uniqueClicks, setUniqueClicks] = useState([]);

//時間內點擊次數
const handleFileView = async (e) =>{
  const file = e.target.files[0];
  setFileNameView(file.name)

  const data = await file.arrayBuffer();
  let workurl = XLXS.read(data);
  const worksheet = workurl.Sheets[workurl.SheetNames[0]];
  
  const jsonData = XLXS.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });
  for(let i = 1; i < jsonData.length; i++){
    let OldUrl = jsonData[i][0];
    let url = jsonData[i][1];
    let encode = url.split("/");
    console.log(encode[3]);
    setOldUrlView(data=>[...data, OldUrl]);
    setNewUrlView(data=>[...data,url]);
    setEncodeIDView(data=>[...data, encode[3]]);
  }
}
const changeTokenView =async ()=>{
  console.log(token);
  console.log(encodeIDView);
}

//加入695969的tag
const addTag = async () =>{
  for(let i = 0; i < encodeIDView.length; i++){
    let Data = await Axios.post(`https://api.pics.ee/v1/links/`+encodeIDView[i]+`/tags?access_token=` + token,
    {"value": ""
    }
    );
    let tagid = Data.data.data.id;
    console.log(tagid);
    setTagID(data=>[...data, tagid]);
  }
  setTagFinish(true);
}
const overView = async ()=>{
  //overView
  for(let i = 0; i < encodeIDView.length; i++){
    let getOverView = "https://api.pics.ee/v1/links/"+encodeIDView[i]+"/overview?access_token="+ token;
    //console.log(getOverView);
    let Data = await Axios.get(getOverView);
    //console.log(Data);
    let totalClicks = Data.data.data.totalClicks;
    let uniqueClicks = Data.data.data.uniqueClicks;
    setTotalClicks(data=>[...data,totalClicks]);
    setUniqueClicks(data=>[...data, uniqueClicks]);
  }
  setFinishView(true);
}


//轉換成Excell表
function changeExcelView(){
  const workbook = new ExcelJs.Workbook(); // 創建試算表檔案
  const sheet = workbook.addWorksheet('工作表範例1'); //在檔案中新增工作表 參數放自訂名稱
  let row = [];
  for(let i = 0; i < oldUrlView.length; i++){
    row.push([oldUrlView[i],newUrlView[i],totalClicks[i],uniqueClicks[i]]);
  }
  console.log(row);
  sheet.addTable({ // 在工作表裡面指定位置、格式並用columsn與rows屬性填寫內容
    name: 'table名稱',  // 表格內看不到的，讓你之後想要針對這個table去做額外設定的時候，可以指定到這個table
    ref: 'A1', // 從A1開始
    columns: [{name:'原本的網址'},{name:'新的網址'},{name:'totalClicks'},{name:'uniqueClicks'}],
    rows: row
  });
  //改變表格樣式
  sheet.getColumn(1).width = 90;
  sheet.getColumn(2).width = 50;
  sheet.getColumn(3).width = 50;
  sheet.getColumn(4).width = 50;

  // 表格裡面的資料都填寫完成之後，訂出下載的callback function
  // 異步的等待他處理完之後，創建url與連結，觸發下載
  workbook.xlsx.writeBuffer().then((content) => {
  const link = document.createElement("a");
    const blobData = new Blob([content], {
      type: "application/vnd.ms-excel;charset=utf-8;"
    });
    link.download = upLoadFile +'.xlsx';
    link.href = URL.createObjectURL(blobData);
    link.click();
  });
}


  
  return (
    <div className="App">
      <div className='overview'>
        <label className='uploadFile'>
            上傳檔案
                <input type={"file"} onChange={(e)=> handleFileView(e)}/>
        </label> {fileNameView}
      </div>
        <div className='overview'>
          
          <button onClick={(e)=>changeTokenView()}>SetToken</button>
          <input type="text" onChange={(e)=>setToken(e.target.value)}/>
        </div>
        <div>
         
          <button onClick={(e)=>addTag()}>getTag</button> 
          {tagfinish ? "AddTag": "Tagloading"}
        </div>
          
        {/* {totalClicks.map(item => <li>{item}</li>)}
        {uniqueClicks.map(item => <li>{item}</li>)} */}
     
        <button onClick={(e)=>overView(e)}>getOverView</button> 
        {finishView ? "Finish": "Loading"}
        <div>
         
        </div>
       
        <div className='overview'>
          <label htmlFor="">檔名:</label>
          <input type="text" onChange = {(e)=>{setUpLoadFile(e.target.value)}}/>    
          <button onClick={(e)=>changeExcelView()}>轉換成Excel表</button>
        </div>
    </div>
  );
}

export default App;
