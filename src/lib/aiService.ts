import type { AISettings, PalaceData, BaziData, HoroscopeState, DivinationResult } from '../types';

const STORAGE_KEY = 'xuanji_ai_settings_v1';

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'gemini',
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  openrouterApiKey: '',
  openrouterModel: 'deepseek/deepseek-r1',
  customBaseUrl: '',
  temperature: 0.7,
};

export function getStoredAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_AI_SETTINGS;
  }
}

export function saveStoredAISettings(settings: AISettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// Global System Prompt for Master Astrologer
const MASTER_SYSTEM_PROMPT = `你是享譽華人世界的資深國學易經命理宗師，精通紫微斗數中州三合派、欽天四化派與子平八字。
在進行排盤與占卜解讀時，請遵守以下原則：
1. 【有主有次，切中要害】：不堆砌深奧生僻術語，每句斷語後緊跟白話解釋。
2. 【注重吉凶衡平】：既指出生年四化與吉星之機遇，亦如實點出煞忌之暗礁，不模稜兩可。
3. 【現代可落地決策建議】：所有分析必須轉化為職涯、資產、人際、心態上的現代具體行動指南。
4. 【繁體中文輸出】：使用標準台灣/繁體中文（zh-TW）精闢排版，分段清晰，善用小標題與條列。`;

// Dynamic fetch available models for Gemini API
export async function fetchAvailableGeminiModels(
  apiKey: string,
  customBaseUrl?: string
): Promise<{ id: string; name: string; description?: string }[]> {
  if (!apiKey?.trim()) {
    throw new Error('請先輸入 Gemini API Key');
  }

  const baseUrl = customBaseUrl?.trim() || 'https://generativelanguage.googleapis.com';
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/v1beta/models?key=${apiKey.trim()}`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    const errText = await res.text();
    let msg = `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error?.message) msg = parsed.error.message;
    } catch {}
    throw new Error(`獲取 Gemini 模型清單失敗 (${res.status}): ${msg}`);
  }

  const data = await res.json();
  const rawList = data.models || [];
  const supported = rawList
    .filter((m: any) => {
      const methods = m.supportedGenerationMethods || [];
      return methods.includes('generateContent');
    })
    .map((m: any) => {
      const cleanId = m.name.replace(/^models\//, '');
      const dName = m.displayName || cleanId;
      return {
        id: cleanId,
        name: `${dName} (${cleanId})`,
        description: m.description || ''
      };
    });

  // Sort so gemini-2.0, gemini-1.5 come first
  supported.sort((a: any, b: any) => {
    const aScore = a.id.includes('2.0') ? 2 : a.id.includes('1.5') ? 1 : 0;
    const bScore = b.id.includes('2.0') ? 2 : b.id.includes('1.5') ? 1 : 0;
    return bScore - aScore;
  });

  return supported;
}

// Dynamic fetch available models for OpenRouter API
export async function fetchAvailableOpenRouterModels(
  apiKey?: string,
  customBaseUrl?: string
): Promise<{ id: string; name: string }[]> {
  const baseUrl = customBaseUrl?.trim() || 'https://openrouter.ai/api/v1';
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/models`;

  const headers: Record<string, string> = {};
  if (apiKey?.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  const res = await fetch(endpoint, { headers });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`獲取 OpenRouter 模型清單失敗 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return (data.data || []).map((m: any) => ({
    id: m.id,
    name: `${m.name || m.id} (${m.id})`
  }));
}

export async function callAIModel(prompt: string, customSystemPrompt?: string): Promise<string> {
  const settings = getStoredAISettings();
  const sysPrompt = customSystemPrompt || MASTER_SYSTEM_PROMPT;

  if (settings.provider === 'gemini') {
    if (!settings.geminiApiKey) {
      throw new Error('請先在「AI 設定」中填入您的 Google Gemini API Key。');
    }

    const cleanModel = (settings.geminiModel || 'gemini-2.0-flash').trim().replace(/^models\//, '');
    const baseUrl = settings.customBaseUrl?.trim() || 'https://generativelanguage.googleapis.com';
    const endpoint = `${baseUrl.replace(/\/+$/, '')}/v1beta/models/${cleanModel}:generateContent?key=${settings.geminiApiKey.trim()}`;

    // Request payload with systemInstruction
    const reqBody: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: settings.temperature ?? 0.7,
        maxOutputTokens: 4096
      }
    };

    if (sysPrompt) {
      reqBody.systemInstruction = {
        parts: [{ text: sysPrompt }]
      };
    }

    let res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody)
    });

    // Fallback: If 400 error due to systemInstruction unsupported on a legacy model, retry by prepending to user prompt
    if (!res.ok && res.status === 400 && reqBody.systemInstruction) {
      const fallbackBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `[系統背景提示]\n${sysPrompt}\n\n[使用者請求]\n${prompt}` }]
          }
        ],
        generationConfig: reqBody.generationConfig
      };
      const retryRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fallbackBody)
      });
      if (retryRes.ok) {
        res = retryRes;
      }
    }

    if (!res.ok) {
      const errText = await res.text();
      let errorMsg = `HTTP ${res.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error?.message) {
          errorMsg = errJson.error.message;
        }
      } catch {}
      throw new Error(`Gemini API 請求失敗 (${res.status}): ${errorMsg}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error('Gemini API 未回傳有效內容，請檢查模型名稱或配額。');
    return candidateText;

  } else {
    // OpenRouter Provider
    if (!settings.openrouterApiKey) {
      throw new Error('請先在「AI 設定」中填入您的 OpenRouter API Key。');
    }

    const model = settings.openrouterModel || 'deepseek/deepseek-r1';
    const baseUrl = settings.customBaseUrl?.trim() || 'https://openrouter.ai/api/v1';
    const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.openrouterApiKey.trim()}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': '玄璣紫微八字解盤系統'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: settings.temperature
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter API 請求失敗 (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenRouter API 未回傳內容，請檢查模型支援度或額度。');
    return content;
  }
}

// Generate Full Chart AI Prompt
export function buildFullChartPrompt(
  name: string,
  gender: string,
  solarDate: string,
  lunarDate: string,
  fiveElementsClass: string,
  soul: string,
  body: string,
  bazi: BaziData,
  palaces: PalaceData[],
  horoscope: HoroscopeState
): string {
  const palacesSummary = palaces.map(p => {
    const stars = p.majorStars.map(s => `${s.name}${s.brightness ? `(${s.brightness})` : ''}${s.mutagen ? `[化${s.mutagen}]` : ''}`).join('、') || '無主星(空宮)';
    const aux = p.minorStars.map(s => s.name).join(' ');
    const mut = p.selfMutagens.map(sm => `${sm.star}自化${sm.mutagen}`).join(' ');
    return `【${p.name} (${p.heavenlyStem}${p.earthlyBranch})】: 主星: ${stars} | 輔煞: ${aux} ${mut ? `| 自化: ${mut}` : ''} | 大限: ${p.decadalRange[0]}~${p.decadalRange[1]}歲`;
  }).join('\n');

  return `請為以下命造進行全方位的紫微斗數 + 八字交叉印證大師精批：

【命主基本生辰檔案】
- 命主姓名：${name} (${gender === '男' ? '乾造·陽男' : '坤造·陰女'})
- 西曆生辰：${solarDate}
- 農曆生辰：${lunarDate}
- 五行局數：${fiveElementsClass} | 命主星：${soul} | 身主星：${body}

【子平八字四柱資訊】
- 年柱：${bazi.year.stem}${bazi.year.branch} (${bazi.year.stemShiShen}) - 納音: ${bazi.year.nayin}
- 月柱：${bazi.month.stem}${bazi.month.branch} (${bazi.month.stemShiShen}) - 納音: ${bazi.month.nayin}
- 日柱：${bazi.day.stem}${bazi.day.branch} (日主: ${bazi.dayMaster}，判定為 ${bazi.dayMasterStrength}) - 納音: ${bazi.day.nayin}
- 時柱：${bazi.hour.stem}${bazi.hour.branch} (${bazi.hour.stemShiShen}) - 納音: ${bazi.hour.nayin}
- 五行權重比：木${bazi.fiveElements.wood}%、火${bazi.fiveElements.fire}%、土${bazi.fiveElements.earth}%、金${bazi.fiveElements.metal}%、水${bazi.fiveElements.water}%

【紫微斗數十二宮盤面結構】
${palacesSummary}

【當前大限與流年時運】
- 當前大限：${horoscope.decadalInfo?.ageRange[0]}~${horoscope.decadalInfo?.ageRange[1]}歲 (${horoscope.decadalInfo?.stem}${horoscope.decadalInfo?.branch}大限疊本命${horoscope.decadalInfo?.name})
- 當前流年：${horoscope.selectedYear}年 (${horoscope.yearlyInfo?.stem}${horoscope.yearlyInfo?.branch}歲君，虛歲${horoscope.yearlyInfo?.nominalAge}歲)
${horoscope.yearlyInfo?.mutagens?.map(m => `- 流年化${m.mutagen}: ${m.star}`).join('\n') || ''}

請按以下結構撰寫一篇約 1,000 ~ 1,500 字的深度專業命理評批：
一、命格核心主軸與先天心性（命宮、身宮、來因宮定調）
二、事業成就天花板與財富資產格局（官祿宮、財帛宮、田宅宮聯動）
三、姻緣感情與家庭親密關係透視（夫妻宮、福德宮特質與關鍵課題）
四、當前大限 (10年) 攻守戰略與轉折點
五、當前流年歲君吉凶預警（祿入何處、忌沖何處、重大防範）
六、現代處世哲學與知命造運具體錦囊妙計`;
}

// Generate Divination AI Prompt
export function buildDivinationPrompt(result: DivinationResult): string {
  const stars = [...result.majorStars, ...result.minorStars].map(s => `${s.name}${s.brightness ? `(${s.brightness})` : ''}${s.mutagen ? `[化${s.mutagen}]` : ''}`).join('、') || '無主星';

  return `請身為易經紫微神課宗師，為以下求問者進行「一事一占 · 神卦精批」：

【求問事項資訊】
- 所問具體問題：【${result.question}】
- 問事所屬類別：${result.category}
- 占卜起卦時間：${result.castTime}
- 起卦方式：${result.method === 'horary' ? '動態時空正時卦' : `心念報數起卦 (${result.numbers?.join(', ')})`}

【占卜卦象星曜配置】
- 事由用神宮位：【${result.targetPalaceName}】
- 用神宮內星曜：${stars}
- 對宮沖照宮位：【${result.oppositePalaceName}】
- 四化引動效應：${result.sihuaImpact.join('； ') || '無重大化曜'}
- 本地初算法吉凶等級：${result.outcomeGrade} (綜合評分: ${result.score}分)
- 初步推導應期：${result.timingWindow}

請以極具權威感、神驗且富有現代心理指導性的語言，為求問者撰寫一份「占卜斷卦錦囊報告」：
1. 【乾坤定調】：直截了當地給出此事的吉凶定性（成/敗/滯/變），不模稜兩可。
2. 【星象玄機剖析】：用神宮位之主煞星如何交會？對宮沖照有何外在變數？四化星如何決定事態走向？
3. 【時機應期推斷】：何時為最佳突破窗口？何時為暗礁爆發之危險期？
4. 【行動避凶錦囊】：給予求問者 3 條立竿見影的具體處世行動指引。`;
}
