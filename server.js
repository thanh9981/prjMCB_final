var express = require("express")// khai báo thư viện express
var mysql = require('mysql')
var mqtt = require('mqtt')  // tạo biến mqtt sử dụng các chức năng của module mqtt
var app = express()// tạo 1 instance của express vào biến app
var port = 8683 
var con = mysql.createConnection({// tạo kết nối đến csdl 
 	host: "localhost",
  	user: "root",
  	password: "",
  	database: "mcb2022"
});
con.connect(function(err){// truy vấn csdl
    if(err) throw err;
    console.log("mysql connected")
})
app.use('/public', express.static('public'));
app.set("view engine", "ejs")
app.set("views","./view")
app.get("/",function(req,res){
    res.render("index") 
})
var server = require("http").Server(app);// tạo 1 server http và lắng nghe các request(yêu cầu) đến với app
var io = require("socket.io")(server);// tạo 1 socket.io lắng nghe server http mình vừa tạo
server.listen(port);
////////MQTT///
var client = mqtt.connect('mqtt://192.168.232.248');
client.on('connect',function(){// funcion có chức năng sub 1 topic nếu đã kết nối thành công đến broker
    console.log("mqtt connected")
    client.subscribe("sensor")
})
client.on("message",function(topic,message,h){// gửi 1 gói tin đến topic đã đăng kí
    const data = JSON.parse(message)// chuõi để phân tích dưới dạng json
    var state_1 = data.state_1              //"1" la bat
    var state_2 = data.state_2
    var temp_data =  data.temperature.toFixed(2)
    var humi_data =  data.humidity.toFixed(2)
    var light_data = data.light.toFixed(2)
    var sql = "insert into datasensors(temp,humi,light) value ( "+temp_data+" , "+humi_data+" ,"+light_data+")"
    con.query(sql,function(err,result){
        if (err) throw err
        // console.log( " temp: "+temp_data+" ,humi: "+humi_data+", light: "+light_data+" ")
    })
      

    io.emit("temp",temp_data)// gửi đến tất cả client kết nối đến
    io.emit("humi",humi_data)
    io.emit("light",light_data)
    io.emit("relay_1",state_1)
    io.emit("relay_2",state_2)
})

io.on("connection",function(socket){// mọi sự kiện của client được xử lí trong io.on
    // khi kết nối đến server thì sẽ có 1 định danh socket riêng và server xử lí yêu cầu và phản hồi được khai báo trong callback
    console.log('user ' + socket.id + " connected")
    socket.on("control_relay_1",function(state1){
        if(state1 == "1"){
            client.publish("relay_1","1")
            con.query("insert into relay(relay_id, state) value ( 'relay_1' , 'ON') " )
        }else{
            client.publish("relay_1","0")
            con.query("insert into relay(relay_id, state) value ( 'relay_1' , 'OFF') " )
        }
    })

    socket.on("control_relay_2",function(state2){
        if(state2 == "1"){
            client.publish("relay_2","1")
            con.query("insert into relay(relay_id, state) value ( 'relay_2' , 'ON') " )
        }else{
            client.publish("relay_2","0")
            con.query("insert into relay(relay_id, state) value ( 'relay_2' , 'OFF') " )
           
        }
    })
})