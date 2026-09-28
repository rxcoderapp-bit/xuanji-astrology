/**
 * 天樞星象 · 古籍 RAG 知識檢索與智能注入引擎 (RAG Engine)
 * 從 440 萬字正統古籍智庫中精確召回與命局、宮位、時運相應之原典，
 * 並將其注入 AI Prompt，提供具權威原典引證的大師級解盤與專題問答。
 * （嚴格去除所有個人姓名，純粹古典正統體系與自有品牌傳承）
 */

import type { 
  ClassicalCorpusItem, 
  RAGSearchResult, 
  ClassicalCategory, 
  PalaceData, 
  BaziData, 
  HoroscopeState 
} from '../types';
import { CLASSICAL_METAPHYSICS_CORPUS } from '../data/classicalMetaphysicsCorpus';
import { callAIModel } from './aiService';

// =========================================================================
// 1. 古籍關鍵字分詞與相關性檢索 (Search Algorithm)
// =========================================================================
export function searchClassicalCorpus(
  query: string,
  category: ClassicalCategory | 'all' = 'all',
  limit: number = 6
): RAGSearchResult[] {
  if (!query || query.trim() === '') {
    const list = category === 'all' 
      ? CLASSICAL_METAPHYSICS_CORPUS 
      : CLASSICAL_METAPHYSICS_CORPUS.filter(item => item.category === category);
    return list.slice(0, limit).map(item => ({
      item,
      score: 10,
      matchedKeywords: []
    }));
  }

  // 分詞：將查詢分割為關鍵字與單字雙字片段
  const cleanQuery = query.trim().replace(/[，。！？、；：\s]+/g, ' ');
  const rawTerms = cleanQuery.split(' ').filter(Boolean);
  
  // 生成二元與三元片段（如 "武曲七殺" -> "武曲", "七殺", "武曲七殺"）
  const searchTerms: string[] = [];
  rawTerms.forEach(t => {
    searchTerms.push(t);
    if (t.length >= 4) {
      searchTerms.push(t.slice(0, 2));
      searchTerms.push(t.slice(2, 4));
    }
  });

  const uniqueTerms = Array.from(new Set(searchTerms)).filter(t => t.length >= 1);

  const results: RAGSearchResult[] = [];

  const candidatePool = category === 'all' 
    ? CLASSICAL_METAPHYSICS_CORPUS 
    : CLASSICAL_METAPHYSICS_CORPUS.filter(item => item.category === category);

  candidatePool.forEach(item => {
    let score = 0;
    const matched: string[] = [];

    uniqueTerms.forEach(term => {
      // 標題命中（最高權重 8分）
      if (item.title.includes(term)) {
        score += 8;
        matched.push(term);
      }

      // 關鍵字標籤命中（高權重 6分）
      if (item.keywords.some(k => k.includes(term) || term.includes(k))) {
        score += 6;
        matched.push(term);
      }

      // 原文引證命中（中權重 4分）
      if (item.originalText.includes(term)) {
        score += 4;
        matched.push(term);
      }

      // 白話釋義與實戰指南命中（2分）
      if (item.vernacularMeaning.includes(term) || item.practicalGuidance.includes(term)) {
        score += 2;
        matched.push(term);
      }

      // 出處書籍命中（3分）
      if (item.sourceBook.includes(term)) {
        score += 3;
      }
    });

    if (score > 0) {
      results.push({
        item,
        score,
        matchedKeywords: Array.from(new Set(matched))
      });
    }
  });

  // 按得分由高至低排序
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

// =========================================================================
// 2. 針對當前命盤情境智慧抽取古籍關聯上下文 (Context Retrieval)
// =========================================================================
export function retrieveContextForChart(
  palace: PalaceData,
  bazi: BaziData,
  horoscope?: HoroscopeState,
  topic?: 'palace' | 'dualTrack' | 'love' | 'health' | 'wealth' | 'career'
): ClassicalCorpusItem[] {
  const queryTokens: string[] = [];

  // 宮位主星
  palace.majorStars.forEach(s => queryTokens.push(s.name));
  queryTokens.push(palace.name);

  // 八字日主與十神
  queryTokens.push(bazi.dayMaster);
  if (bazi.day.branchShiShen) queryTokens.push(bazi.day.branchShiShen);

  if (topic === 'love' || palace.name === '夫妻') {
    queryTokens.push('正緣', '夫妻宮', '紅鸞', '天喜', '天干五合', '地支六合');
  } else if (topic === 'dualTrack') {
    queryTokens.push('體用一元', '雙軌合參', '星神同頻', '五行');
  } else if (topic === 'health') {
    queryTokens.push('五行', '中醫', '調候', '水火既濟', '脾胃');
  }

  if (horoscope?.yearlyInfo?.stem) {
    queryTokens.push(horoscope.yearlyInfo.stem);
  }

  const queryStr = queryTokens.join(' ');
  const matches = searchClassicalCorpus(queryStr, 'all', 4);

  return matches.map(m => m.item);
}

// =========================================================================
// 3. 建構帶有古籍 RAG 知識引證的增強型 Prompt (RAG Prompt Augmentor)
// =========================================================================
export function buildRAGAugmentedPrompt(
  basePrompt: string,
  retrievedItems: ClassicalCorpusItem[]
): string {
  if (!retrievedItems || retrievedItems.length === 0) {
    return basePrompt;
  }

  const citationsBlock = retrievedItems.map((item, idx) => {
    return `[引證典籍 ${idx + 1}]：${item.sourceBook} · 【${item.title}】
原典文句：「${item.originalText}」
義理剖析：${item.vernacularMeaning}
現代落地對策：${item.practicalGuidance}`;
  }).join('\n\n');

  return `${basePrompt}

==================================================
【天樞古籍 RAG 知識庫智慧引證背景】
系統已為您檢索並匹配出 440 萬字古典術數智庫中最相符之權威原典：
${citationsBlock}
==================================================

請您身為正統命理大宗師，在解讀時務必做到：
1. 【引經據典】：適度援引上述古籍原典文句（用雙引號標註出處如《太微紫微賦》或《滴天髓》），展現深厚學術底蘊。
2. 【融會貫通】：將古典文句之陰陽五行哲理，翻譯為適合現代人（職場、情感、理財或身心）之通俗直白語言。
3. 【知命造運】：給予具體、立竿見影且富有同理心的行動錦囊。`;
}

// =========================================================================
// 4. 大師級 AI Studio 靈魂問答服務 (Interactive Metaphysics Q&A)
// =========================================================================
export async function callRAGMetaphysicsStudio(
  question: string,
  chartContext?: {
    palace?: PalaceData;
    bazi?: BaziData;
    horoscope?: HoroscopeState;
    name?: string;
    gender?: string;
  }
): Promise<{ answer: string; citations: ClassicalCorpusItem[] }> {
  // 1. 檢索最相關之古籍知識片段
  const searchResults = searchClassicalCorpus(question, 'all', 4);
  const citations = searchResults.map(r => r.item);

  // 2. 組合問答 Prompt
  let contextDesc = '';
  if (chartContext?.bazi && chartContext?.palace) {
    contextDesc = `
【當前諮詢命造檔案】
- 命主姓名：${chartContext.name || '求問者'} (${chartContext.gender || '男'})
- 八字四柱：${chartContext.bazi.year.stem}${chartContext.bazi.year.branch} / ${chartContext.bazi.month.stem}${chartContext.bazi.month.branch} / ${chartContext.bazi.day.stem}${chartContext.bazi.day.branch} / ${chartContext.bazi.hour.stem}${chartContext.bazi.hour.branch} (日主${chartContext.bazi.dayMaster}，${chartContext.bazi.dayMasterStrength})
- 當前聚焦宮位：【${chartContext.palace.name}】(${chartContext.palace.heavenlyStem}${chartContext.palace.earthlyBranch})，主星：${chartContext.palace.majorStars.map(s => s.name).join('、') || '借對宮'}
- 當前歲運：${chartContext.horoscope?.selectedYear || new Date().getFullYear()}年
`;
  }

  const citationsText = citations.length > 0 
    ? citations.map((c, i) => `[原典 ${i + 1}] ${c.sourceBook}《${c.title}》：「${c.originalText}」\n義理：${c.vernacularMeaning}`).join('\n\n')
    : '無直接匹配典籍，依正統五術體用原則推演。';

  const studioPrompt = `請身為通曉天星斗數、子平八字、五運六氣與易經哲學的大宗師，針對以下求問進行深入淺出、富有哲理與洞見的專題解答：

【求問問題】：
「${question}」
${contextDesc}
【古籍檢索知識庫引證】：
${citationsText}

請依以下結構給予嚴謹、親切且具啟發性的解答：
1. 【原典天機】：引用古籍原理（注明典籍名稱），直擊問題背後的五行氣象或星曜玄機。
2. 【全息剖析】：針對現代人的生活場景（情緒、人際、職涯或婚姻）展開細緻解讀。
3. 【造命錦囊】：提供 2~3 條可具體落地的知命心法與行動指引。`;

  const sysPrompt = '您是精通《太微紫微賦》、《滴天髓》、《窮通寶鑑》與《黃帝內經》的當代命學宗師，言談古典文雅，同時精準洞悉現代社會人際與心理，給予人力量與清晰指引。';

  const answer = await callAIModel(studioPrompt, sysPrompt);

  return {
    answer,
    citations
  };
}
