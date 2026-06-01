#include <WiFi.h>
#include <WiFiManager.h> // Library WiFiManager
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <FonnteDuino.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

// --- Konfigurasi Supabase ---
const String supabase_url = "YOUR_SUPABASE_URL";
const String supabase_key = "YOUR_SUPABASE_KEY";

// --- Konfigurasi Fonnte ---
FonnteDuino fonnte("YOUR_FONNTE_TOKEN"); 

// --- Timer & Interval ---
unsigned long routinePreviousMillis = 0;
unsigned long anomalyPreviousMillis = 0;
unsigned long cloudPreviousMillis = 0;
const long routineInterval = 1260000;
const long anomalyInterval = 600000;
const long cloudInterval   = 60000;

namespace pin {
  const byte tds_sensor = 34;
  const byte one_wire_bus = 15; 
}

namespace device {
  float aref = 3.3;
}

namespace sensor {
  float ec = 0;
  float tds = 0;
  float waterTemp = 0;
  float ecCalibration = 1;
}

OneWire oneWire(pin::one_wire_bus);
DallasTemperature dallasTemperature(&oneWire);

void setup() {
  Serial.begin(115200);
  dallasTemperature.begin();

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("KSI RC KEL 3");
  delay(1000);
  lcd.clear();
  lcd.print("Cek Air");
  
  // WiFiManager
  WiFiManager wm;
  
  Serial.println("Memulai WiFiManager...");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Setup...");
  lcd.setCursor(0, 1);
  lcd.print("Setup-SIPANDAWA");
  
  // Membuka portal "Setup-SIPANDAWA" jika belum terhubung
  bool res = wm.autoConnect("Setup-SIPANDAWA");

  if(!res) {
      Serial.println("Gagal terhubung atau hit timeout");
      lcd.clear();
      lcd.print("Koneksi Gagal");
  } else {
      Serial.println("\nWiFi connected");
      lcd.clear();
      lcd.print("WiFi Terhubung!");
      delay(1000);
  }

  lcd.clear();

  unsigned long currentMillis = millis();
  routinePreviousMillis = currentMillis; 
  cloudPreviousMillis = currentMillis;
}

void kirimDataKeSupabase(float tds, float temp, String status) {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(supabase_url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabase_key);
    http.addHeader("Authorization", "Bearer " + supabase_key);
    http.addHeader("Prefer", "return=minimal");

    // Menambahkan lokasi statis untuk ditampilkan di Web GIS Map Dashboard
    String httpRequestData = "{\"tds_value\":\"" + String(tds, 2) + "\",\"temperature\":\"" + String(temp, 2) + "\",\"status\":\"" + status + "\",\"location_lat\":\"-6.200000\",\"location_lng\":\"106.816666\"}";
    
    Serial.print("Kirim payload ke Supabase: ");
    Serial.println(httpRequestData);

    int httpResponseCode = http.POST(httpRequestData);
    
    if (httpResponseCode > 0) {
      Serial.print("Supabase HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error saat POST ke Supabase: ");
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected. Gagal mengirim ke Supabase.");
  }
}

void loop() {
  baca_Tds();
  delay(1000);
}

void baca_Tds() {
  dallasTemperature.requestTemperatures();
  sensor::waterTemp = dallasTemperature.getTempCByIndex(0);

  int totalAdc = 0;
  const int samples = 10;
  for (int i = 0; i < samples; i++) {
    totalAdc += analogRead(pin::tds_sensor);
    delay(10);
  }
  int adcRaw = totalAdc / samples;

  float rawEc = adcRaw * device::aref / 4095.0;

  float temperatureCoefficient = 1.0 + 0.02 * (sensor::waterTemp - 25.0);
  sensor::ec = (rawEc / temperatureCoefficient) * sensor::ecCalibration;

  sensor::tds = (133.42 * pow(sensor::ec, 3)
              - 255.86 * sensor::ec * sensor::ec
              + 857.39 * sensor::ec) * 0.5;

  Serial.print("ADC Raw: "); Serial.println(adcRaw);
  Serial.print("TDS: "); Serial.println(sensor::tds, 1);
  Serial.print("Temp: "); Serial.println(sensor::waterTemp, 1);

  String status;
  if (sensor::tds <= 50) status = "Murni";
  else if (sensor::tds <= 100) status = "Sangat Bagus";
  else if (sensor::tds <= 200) status = "Bagus";
  else if (sensor::tds <= 300) status = "Ideal";
  else if (sensor::tds <= 400) status = "Cukup Ideal";
  else if (sensor::tds <= 500) status = "Kurang Ideal";
  else status = "Buruk"; 
  
  unsigned long currentMillis = millis();

  // 1. Logika Notifikasi Fonnte WA
  if (sensor::tds > 500) { 
    if (currentMillis - anomalyPreviousMillis >= anomalyInterval) {
        anomalyPreviousMillis = currentMillis;
        Serial.println("!!! ANOMALI TERDETEKSI: Kirim WA Anomali !!!");

        String pesan = "🚨 ANOMALI (10m): Kualitas air BURUK!\n";
        pesan += "TDS: " + String(sensor::tds, 1) + " ppm\n";
        pesan += "Suhu: " + String(sensor::waterTemp, 1) + " °C\n";
        pesan += "Periksa segera!";
        
        fonnte.sendMessage("YOUR_PHONE_NUMBER", pesan); 
        routinePreviousMillis = currentMillis; 
    }
  } else {
    if (currentMillis - routinePreviousMillis >= routineInterval) {
      routinePreviousMillis = currentMillis;
      Serial.println("--- KONDISI NORMAL: Kirim WA Rutin ---");
      
      String pesan = "✅ Pembaruan Rutin: Air saat ini " + status + ".\n";
      pesan += "TDS: " + String(sensor::tds, 1) + " ppm\n";
      pesan += "Suhu: " + String(sensor::waterTemp, 1) + " °C";

      fonnte.sendMessage("YOUR_PHONE_NUMBER", pesan);
      anomalyPreviousMillis = currentMillis;
    }
  }

  // 2. Logika Pengiriman ke Supabase (Interval 1 Menit)
  if (currentMillis - cloudPreviousMillis >= cloudInterval) {
    cloudPreviousMillis = currentMillis;
    kirimDataKeSupabase(sensor::tds, sensor::waterTemp, status);
  }

  // 3. Tampilan LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("TDS:");
  lcd.print(sensor::tds, 1); 
  lcd.print("ppm");

  lcd.setCursor(0, 1);
  lcd.print("T:");
  lcd.print(sensor::waterTemp, 1);
  lcd.print("C ");
  lcd.print(status); 
}