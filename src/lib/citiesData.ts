/**
 * 出生地經緯度數據庫 (全球主要華人城市與省市縣經度表)
 * 用於計算地方真太陽時差（以東八區東經 120° 為基準，每度相差 4 分鐘）
 * （純客觀地理經緯度數據，無任何個人姓名）
 */

export interface CityLocation {
  name: string;
  longitude: number;
}

export interface RegionGroup {
  region: string;
  cities: CityLocation[];
}

export const CITIES_DATA: RegionGroup[] = [
  {
    region: '台灣地區',
    cities: [
      { name: '台北市', longitude: 121.5 },
      { name: '新北市', longitude: 121.5 },
      { name: '桃園市', longitude: 121.3 },
      { name: '台中市', longitude: 120.7 },
      { name: '台南市', longitude: 120.2 },
      { name: '高雄市', longitude: 120.3 },
      { name: '基隆市', longitude: 121.7 },
      { name: '新竹市/縣', longitude: 120.9 },
      { name: '嘉義市/縣', longitude: 120.4 },
      { name: '苗栗縣', longitude: 120.8 },
      { name: '彰化縣', longitude: 120.5 },
      { name: '南投縣', longitude: 120.7 },
      { name: '雲林縣', longitude: 120.5 },
      { name: '屏東縣', longitude: 120.5 },
      { name: '宜蘭縣', longitude: 121.7 },
      { name: '花蓮縣', longitude: 121.6 },
      { name: '台東縣', longitude: 121.1 },
      { name: '澎湖縣', longitude: 119.6 },
      { name: '金門縣', longitude: 118.3 },
      { name: '連江縣(馬祖)', longitude: 119.9 },
    ],
  },
  {
    region: '港澳地區',
    cities: [
      { name: '香港中西區/中環', longitude: 114.15 },
      { name: '香港九龍', longitude: 114.18 },
      { name: '香港新界', longitude: 114.20 },
      { name: '澳門半島', longitude: 113.54 },
      { name: '澳門氹仔/路環', longitude: 113.56 },
    ],
  },
  {
    region: '中國直轄市',
    cities: [
      { name: '北京 (東經116.4°)', longitude: 116.4 },
      { name: '上海 (東經121.5°)', longitude: 121.5 },
      { name: '天津 (東經117.2°)', longitude: 117.2 },
      { name: '重慶 (東經106.5°)', longitude: 106.5 },
    ],
  },
  {
    region: '廣東 / 華南',
    cities: [
      { name: '廣州', longitude: 113.3 },
      { name: '深圳', longitude: 114.1 },
      { name: '東莞', longitude: 113.7 },
      { name: '佛山', longitude: 113.1 },
      { name: '珠海', longitude: 113.5 },
      { name: '中山', longitude: 113.4 },
      { name: '惠州', longitude: 114.4 },
      { name: '汕頭', longitude: 116.7 },
      { name: '南寧', longitude: 108.3 },
      { name: '桂林', longitude: 110.3 },
      { name: '海口', longitude: 110.3 },
      { name: '三亞', longitude: 109.5 },
      { name: '福州', longitude: 119.3 },
      { name: '廈門', longitude: 118.1 },
      { name: '泉州', longitude: 118.6 },
    ],
  },
  {
    region: '華東 / 華中',
    cities: [
      { name: '南京', longitude: 118.8 },
      { name: '蘇州', longitude: 120.6 },
      { name: '無錫', longitude: 120.3 },
      { name: '杭州', longitude: 120.2 },
      { name: '寧波', longitude: 121.5 },
      { name: '溫州', longitude: 120.7 },
      { name: '合肥', longitude: 117.3 },
      { name: '武漢', longitude: 114.3 },
      { name: '長沙', longitude: 113.0 },
      { name: '南昌', longitude: 115.9 },
      { name: '濟南', longitude: 117.0 },
      { name: '青島', longitude: 120.4 },
      { name: '鄭州', longitude: 113.6 },
      { name: '洛陽', longitude: 112.4 },
    ],
  },
  {
    region: '西南 / 西北 / 華北 / 東北',
    cities: [
      { name: '成都', longitude: 104.1 },
      { name: '綿陽', longitude: 104.7 },
      { name: '貴陽', longitude: 106.7 },
      { name: '昆明', longitude: 102.7 },
      { name: '西安', longitude: 108.9 },
      { name: '咸陽', longitude: 108.7 },
      { name: '蘭州', longitude: 103.8 },
      { name: '西寧', longitude: 101.8 },
      { name: '銀川', longitude: 106.3 },
      { name: '烏魯木齊', longitude: 87.6 },
      { name: '喀什', longitude: 75.9 },
      { name: '拉薩', longitude: 91.1 },
      { name: '太原', longitude: 112.5 },
      { name: '石家莊', longitude: 114.5 },
      { name: '呼和浩特', longitude: 111.7 },
      { name: '瀋陽', longitude: 123.4 },
      { name: '大連', longitude: 121.6 },
      { name: '長春', longitude: 125.3 },
      { name: '哈爾濱', longitude: 126.6 },
    ],
  },
  {
    region: '國際海外代表城市',
    cities: [
      { name: '新加坡 (東經103.8°)', longitude: 103.8 },
      { name: '吉隆坡 (東經101.7°)', longitude: 101.7 },
      { name: '東京 (東經139.7°)', longitude: 139.7 },
      { name: '首爾 (東經127.0°)', longitude: 127.0 },
      { name: '曼谷 (東經100.5°)', longitude: 100.5 },
      { name: '雪梨 (東經151.2°)', longitude: 151.2 },
      { name: '墨爾本 (東經144.9°)', longitude: 144.9 },
      { name: '倫敦 (經度0°)', longitude: 0.0 },
      { name: '巴黎 (東經2.3°)', longitude: 2.3 },
      { name: '舊金山 (西經122.4°)', longitude: -122.4 },
      { name: '洛杉磯 (西經118.2°)', longitude: -118.2 },
      { name: '紐約 (西經74.0°)', longitude: -74.0 },
      { name: '溫哥華 (西經123.1°)', longitude: -123.1 },
      { name: '多倫多 (西經79.4°)', longitude: -79.4 },
    ],
  },
];

/** 尋找城市經度，若查無則返回 120 (基準平太陽時) */
export function findCityLongitude(cityName: string): number {
  if (!cityName) return 120;
  for (const group of CITIES_DATA) {
    for (const c of group.cities) {
      if (c.name.includes(cityName) || cityName.includes(c.name)) {
        return c.longitude;
      }
    }
  }
  return 120;
}
