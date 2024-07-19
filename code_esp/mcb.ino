#include <DHTesp.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Arduino_JSON.h>

#define dht_pin D5
#define dht_type DHT11
DHTesp dht;
const char* ssid = "Hihi";
const char* password = "14122001";
const char* mqtt_server = "thachthanh.vov.link";
WiFiClient espClient;
PubSubClient client(espClient);
#define MSG_BUFFER_SIZE  (50)
char msg[MSG_BUFFER_SIZE];
char temp_str[50];         
char humi_str[50];
char light_str[50];
char messageBuff[100];    //mảng chứa chuỗi mà client gửi tới
JSONVar data;       //lưu trữ giá trị cảm biến dưới dạng json

int value = 0;

void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {// in ra dấu chấm nếu chưa kết nối mạng wifi
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());
// connect thành công
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

#define sub1 "relay_1"
#define sub2 "relay_2"
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
if (strstr(topic,sub1)){                      // lệnh strstr là tìm kiếm trong topic có sub1 hay không
    for (int i = 0; i < length; i++) {
      Serial.print((char)payload[i]);
    }
    Serial.println();
    if ((char)payload[0] == '1') {
      digitalWrite(D1, HIGH);                  // Turn the LED on (relay mức tích cực thấp)
    } else {
      digitalWrite(D1, LOW);                 // Turn the LED off by making the voltage HIGH
    }    
  }

  else if ( strstr(topic,sub2))
  {
    for (int i = 0; i < length; i++) {
      Serial.print((char)payload[i]);
    }
    Serial.println();
    // Switch on the LED if an 1 was received as first character
    if ((char)payload[0] == '1') {
      digitalWrite(D2, HIGH);   // Turn the LED on (Note that LOW is the voltage level
    } else {
      digitalWrite(D2, LOW);  // Turn the LED off by making the voltage HIGH
    }
  }
}

void reconnect() {// hàm thực hiện kết nối lại với server khi bị mất kết nối 
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      client.subscribe(sub1);
      client.subscribe(sub2);
    } else {
      Serial.println(" try again in 2 seconds");
      // Wait 5 seconds before retrying
      delay(1000);
    }
  }
}




void setup() {
  pinMode(BUILTIN_LED, OUTPUT);     // Initialize the BUILTIN_LED pin as an output
  pinMode(D1, OUTPUT);
  pinMode(D2, OUTPUT);
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);// hàm thực hiện chức năng pub/sub
  dht.setup(dht_pin, DHTesp::dht_type); //for DHT11 Connect DHT sensor to GPIO 17
  
}

void loop() {

  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  

    int state_1 = digitalRead(D1);
    int state_2 = digitalRead(D2);
    float temp = dht.getTemperature();
    float humi = dht.getHumidity();
    float light = analogRead(A0);

    data["temperature"] = temp;// {"temperature":"temp"}
    data["humidity"] = humi;
    data["light"] = light;
    data["state_1"] = state_1;
    data["state_2"] = state_2;

    Serial.println(state_1);
    Serial.println(state_2);
    Serial.println();
    
    Serial.println(temp);
    Serial.println(humi);
    Serial.println(light);

    String jsonString = JSON.stringify(data);// chuyển đổi giá trị js thành chuỗi json {""}
    client.publish("sensor", jsonString.c_str());
    delay(1000);

}
