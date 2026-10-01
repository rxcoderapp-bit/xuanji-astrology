# 天樞星象 - Android APK 與 AAB 發佈說明

本目錄包含天樞星象紫微斗數八字互動式解盤系統的 Android 原生封裝安裝檔與發佈資源。

---

## 檔案清單

| 檔案名稱 | 格式 | 檔案大小 | 用途說明 |
| :--- | :--- | :--- | :--- |
| **`天樞星象_v1.0.0_release.apk`** | Android Application Package | ~4.9 MB | **手機直接安裝測試檔**。可直接傳至任何 Android 手機、平板或模擬器點擊安裝（已完成正式版離線自簽名）。 |
| **`天樞星象_v1.0.0_release.aab`** | Android App Bundle | ~4.8 MB | **Google Play 商店上架專用包**。符合 Google Play 最新上架規範（API 35 / Android 15），可直接上傳至 Google Play Console 發佈。 |
| **`app-icon.jpg`** | 1024x1024 高解析圖標 | ~800 KB | 天樞星盤古典宇宙美學 App 原創圖標（金屬星盤天樞北斗、硃砂紅曜黑背景）。 |
| **`tianshu.keystore`** | Java KeyStore | ~2.7 KB | 正式發佈專用數位簽名金鑰庫（有效期 25 年至 2051 年）。 |

---

## 數位簽名憑證資訊 (Keystore Information)

- **金鑰檔案 (Keystore Path)**: `release/tianshu.keystore`（同時備份於 `android/app/tianshu.keystore`）
- **金鑰別名 (Key Alias)**: `tianshu`
- **庫密碼 (Store Password)**: `tianshu_astrology_2026`
- **金鑰密碼 (Key Password)**: `tianshu_astrology_2026`
- **憑證主體 (DN)**: `CN=TianShu, OU=Astrology, O=XuanJi, L=Taipei, ST=Taiwan, C=TW`
- **有效年限**: 10,000 天

---

## 應用程式核心規格

- **應用程式名稱 (App Name)**: 天樞星象
- **套件名稱 (Package ID)**: `com.xuanji.astrology`
- **目標 SDK (Target SDK)**: 35 (Android 15)
- **最低支援 SDK (Min SDK)**: 24 (Android 7.0 Nougat，覆蓋 99%+ Android 設備)
- **編譯工具 (Build Tools)**: 35.0.0 / Gradle 8.14.3 / OpenJDK 17

---

## 後續一鍵更新指令

若未來前端網頁代碼有更新，可於專案根目錄執行以下指令一鍵重新編譯：

```bash
# 1. 重新同步網頁產物並產生最新 Release APK
npm run android:apk

# 2. 重新同步網頁產物並產生最新 Google Play AAB
npm run android:aab

# 3. 僅同步最新網頁代碼到 Android 專案
npm run android:sync

# 4. 在 Android Studio 中開啟專案
npm run android:open
```
