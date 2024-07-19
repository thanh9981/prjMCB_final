const socket = io()

const sttTerm = document.getElementById("a")
const sttHumi = document.getElementById("b")
const sttLight = document.getElementById("c")
const sttLed1 = document.getElementById("ON")
const sttLed2 = document.getElementById("OFF")
const sttDieuhoa1 = document.getElementById("ON1")
const sttDieuhoa2 = document.getElementById("OFF1")
// server lắng nghe dữ liệu từ client
  socket.on("temp",function(data_received){
      let nhietdo = data_received
      document.getElementById("Term").innerHTML = nhietdo + "°C"

      if(nhietdo <= 20){
        
        sttTerm.style.backgroundColor = "blue";
      }else if(nhietdo <= 30){
        sttTerm.style.backgroundColor = "orange";
      }else{
        //if(confirm("Cảnh báo")== true){
          sttTerm.style.backgroundColor = "red";
        //}
  
      }

      //thêm giá trị vào biểu đồ
      updatee.data.datasets[0].data.push(nhietdo)
      updatee.data.labels.push(new Date().getSeconds());
  })

  socket.on("humi",function(data_received){
    let doam = data_received
    document.getElementById("Humi").innerHTML = doam + "%"
    
    if(doam <= 10){
      sttHumi.style.backgroundColor = "lightcyan";
    }else if(doam <= 60){
      sttHumi.style.backgroundColor = "lightblue";
      {
        document.getElementById("myImage2").src="/public/image/quat_off.png"
        sttDieuhoa2.style.backgroundColor = "red";
        sttDieuhoa1.style.backgroundColor = "white";  
        // socket.emit("control_relay_2","0")// gửi cho tất cả client 
      }

    }else{
      if(confirm("canh bao")==true)
      {
        sttHumi.style.backgroundColor = "blue";
        document.getElementById("myImage2").src="/public/image/quat_on.png"
        sttDieuhoa1.style.backgroundColor = "green";
        sttDieuhoa2.style.backgroundColor = "white";
        // socket.emit("control_relay_2","1")
      }
      
     
     
    }

    updatee.data.datasets[1].data.push(doam)
    //updatee.data.labels.push(new Date().getSeconds());
  })

  socket.on("light",function(data_received){
    let anhsang = data_received
    document.getElementById("Light").innerHTML = anhsang +" lux"

    if(anhsang <= 10){
      sttLight.style.backgroundColor = "lightcyan";
    }else if(anhsang <= 50){
      sttLight.style.backgroundColor = "lightgoldenrodyellow";
      socket.emit("control_relay_1","1")
      socket.emit("control_relay_2","1")
    }else{
      sttLight.style.backgroundColor = "yellow";
      socket.emit("control_relay_1","0")
      socket.emit("control_relay_1","0")
    }

      updatee.data.datasets[2].data.push(anhsang)
      updatee.update()
        updatee.data.labels.push(new Date().getSeconds());
        updatee.data.labels.shift()
        function updateChart(){
        //   if(updatee.data.labels.length > 3){
        //     updatee.data.datasets[0].data.shift()
        //     updatee.data.datasets[1].data.shift()
        //     updatee.data.datasets[2].data.shift()
        //     updatee.data.labels.shift()
        //   }
        // }
      
        // updateChart()
        }
  })

//   function updateChart(){
//     update.data.datasets[0].data.push(nhietdo)
//     update.data.datasets[1].data.push(doam)
//     update.data.datasets[2].data.push(anhsang)
//     update.data.labels.push(new Date().getSeconds());
//     update.update()
//     if(update.data.labels.length > 3){
//     update.data.datasets[0].data.shift()
//     update.data.datasets[1].data.shift()
//     update.data.datasets[2].data.shift()
//     update.data.labels.shift()
//     }
// }
// updateChart()

//thiết lập chart ban đầu
const updatee = new Chart("myChart", {
  type: "line",
  data: {
    labels: [],
    datasets: [{
        label: "Nhiệt độ",
        lineTension: 0.5,
        backgroundColor: "red",      // màu các điểm
        borderColor: "red",         //màu đường kẻ
        data: []
        // barPercentage: 0.5,
        // barThickness: 6,
        // maxBarThickness: 8,
        // minBarLength: 2,
        // data: []
      },{
        label: "Độ ẩm",
        lineTension: 0.5,
        backgroundColor: "blue",      
        borderColor: "blue",         
        data: []
        // barPercentage: 0.5,
        // barThickness: 6,
        // maxBarThickness: 8,
        // minBarLength: 2,
        // data: []
      },{
        label: "Ánh sáng",              
        lineTension: 0.5,
        backgroundColor: "yellow",      
        borderColor: "yellow",         
        data: []
        // barPercentage: 0.5,
        // barThickness: 6,
        // maxBarThickness: 8,
        // minBarLength: 2,
        // data: []
      }
    ]
  },
  options: {
    // legend: {
    //   display: false
    // },
    scales: {
      x: {
        title:{
          display: false,
          text: "TIME (s)"
        }
      }
    }
  }
})





function on(){
  if(confirm("Bật đèn")== true){    
      document.getElementById("myImage").src="/public/image/lightbulb_on.png"
      sttLed1.style.backgroundColor = "green";
      sttLed2.style.backgroundColor = "white";
      socket.emit("control_relay_1","1")
    }
}
function off(){
    if(confirm("Tắt đèn")== true){      
        document.getElementById("myImage").src="/public/image/lightbulb.png"
        sttLed2.style.backgroundColor = "red";
        sttLed1.style.backgroundColor = "white";
        socket.emit("control_relay_1","0")// sau khi lắng nghe dữ liệu, server phát lại dữ liệu này đến các client khác 

      }
}
function on1(){
    if(confirm("Bật quạt")== true){      
        document.getElementById("myImage2").src="/public/image/quat_on.png"
        sttDieuhoa1.style.backgroundColor = "green";
        sttDieuhoa2.style.backgroundColor = "white";
        socket.emit("control_relay_2","1")// phát ra các sự kiện ở 1 bên và đăng kí người nghe ở bên kia
      }
}
function off1(){
    if(confirm("Tắt quạt")== true){    
      document.getElementById("myImage2").src="/public/image/quat_off.png"
        sttDieuhoa2.style.backgroundColor = "red";
        sttDieuhoa1.style.backgroundColor = "white";  
        socket.emit("control_relay_2","0")// gửi cho tất cả client 
  }
}                                  
// function showChart(){
//   if(confirm("bạn có muốn hiển thị biểu đồ không?")==true){

//   document.getElementById("myChart").style.opacity = "1"
//   document.getElementById("button_chart").remove()
//   }
  
//  }

//cập nhật chart 
