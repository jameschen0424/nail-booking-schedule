/**
 * 解析美甲師貼上的班表文字
 * 支援格式如：
 * - "5/1 18:00後"
 * - "16號 11:00, 14:00, 17:00後"
 * - "23 (日) 休假"
 * - "5月25號 14:00、17:00後"
 */
export function parseScheduleText(text, defaultYear = new Date().getFullYear(), defaultMonth = new Date().getMonth() + 1) {
  const result = {
    year: defaultYear,
    month: defaultMonth,
    days: {} // 鍵值為日(1-31)，值為 { slots: [], isOff: boolean, rawText: string }
  };

  if (!text || typeof text !== 'string') return result;

  // 1. 嘗試解析月份 (例如："2026年5月", "5月預約表", "05 May")
  const monthMatch = text.match(/(\d{4})[年/-](\d{1,2})月?/i) || text.match(/(\d{1,2})\s*月/i);
  if (monthMatch) {
    if (monthMatch.length === 3) {
      result.year = parseInt(monthMatch[1], 10);
      result.month = parseInt(monthMatch[2], 10);
    } else if (monthMatch.length === 2) {
      result.month = parseInt(monthMatch[1], 10);
    }
  } else {
    // 英文月份縮寫檢測
    const englishMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const lowerText = text.toLowerCase();
    for (let i = 0; i < englishMonths.length; i++) {
      if (lowerText.includes(englishMonths[i])) {
        result.month = i + 1;
        // 尋找可能的四位數年份
        const yearMatch = text.match(/\b(20\d{2})\b/);
        if (yearMatch) {
          result.year = parseInt(yearMatch[1], 10);
        }
        break;
      }
    }
  }

  // 2. 逐行解析
  const lines = text.split(/\n/);
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // 嘗試尋找日期標記
    // 匹配如: 5/12, 12號, 12日, 12(一), 12 (日), 或是行首獨立的數字 12.
    // 避免誤配時間如 11:00 裡面的數字
    let day = null;
    let remainingText = trimmed;

    // 格式 A: M/D 或 M-D (例如 5/12, 05/02)
    const mdMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})/);
    if (mdMatch) {
      day = parseInt(mdMatch[2], 10);
      remainingText = trimmed.substring(mdMatch[0].length);
    } else {
      // 格式 B: 行首或括號前的數字，後面接著「號」或「日」或空格/括號 (例如 12號, 12日, 12(一), 12號(一))
      const dayMatch = trimmed.match(/^(\d{1,2})\s*(?:號|日)?(?:\s*[\(（][一二三四五六日a-zA-Z][\)）])?\s*(?:號|日)?/);
      if (dayMatch && !trimmed.match(/^\d{1,2}:\d{2}/)) {
        day = parseInt(dayMatch[1], 10);
        remainingText = trimmed.substring(dayMatch[0].length);
      }
    }

    if (day === null || day < 1 || day > 31) return;

    // 清理剩餘文字中的分隔符號，如冒號、破折號、等號、空格
    remainingText = remainingText.replace(/^[:：=\-\s]+/, '').trim();

    // 3. 檢查是否休假
    const isOff = /休|休息|休假|off|close/i.test(remainingText);

    if (isOff) {
      result.days[day] = {
        slots: [],
        isOff: true,
        rawText: trimmed
      };
      return;
    }

    // 4. 提取時間段
    const slots = [];
    
    // 正則匹配時間格式：
    // - HH:MM (如 11:00, 14:00)
    // - HH:MM後 或 HH:MM起 (如 17:00後, 18:30起)
    // - HH點 或 HH點半 
    // - 單獨的數字時間 (如 11、14、17，但必須在特定脈絡避免與日期混淆，通常有逗號或空格隔開)
    
    // 先找標點時間 (HH:MM後/起/半/...)
    // 匹配如 11:00後, 11:00, 18:30
    const timeRegex = /(\d{1,2}:\d{2}(?:\s*[後起])?)/g;
    const matches = remainingText.match(timeRegex);
    
    if (matches && matches.length > 0) {
      matches.forEach(m => {
        // 標準化：去除空格，統一為「後」或無後綴
        let s = m.replace(/\s+/g, '').replace('起', '後');
        slots.push(s);
      });
    } else {
      // 嘗試匹配「XX點」或「XX點半」
      const pointTimeRegex = /(\d{1,2})點(半)?(?:\s*[後起])?/g;
      let pMatch;
      while ((pMatch = pointTimeRegex.exec(remainingText)) !== null) {
        const hour = parseInt(pMatch[1], 10);
        const isHalf = !!pMatch[2];
        const isAfter = pMatch[0].includes('後') || pMatch[0].includes('起');
        const formattedTime = `${hour.toString().padStart(2, '0')}:${isHalf ? '30' : '00'}${isAfter ? '後' : ''}`;
        slots.push(formattedTime);
      }

      // 如果都沒有匹配到，但有數字列表 (例如 "11、14、17")
      if (slots.length === 0) {
        const numListRegex = /\b(\d{1,2})(?:\s*[後起])?\b/g;
        let nMatch;
        while ((nMatch = numListRegex.exec(remainingText)) !== null) {
          const val = parseInt(nMatch[1], 10);
          // 確保是合理的小時 (e.g. 8 到 22 之間)
          if (val >= 8 && val <= 22) {
            const isAfter = nMatch[0].includes('後') || nMatch[0].includes('起');
            slots.push(`${val.toString().padStart(2, '0')}:00${isAfter ? '後' : ''}`);
          }
        }
      }
    }

    // 只有在真的有時間或已經標記為非休假時才填入
    if (slots.length > 0) {
      // 排序時間，把帶有「後」的放在最後，其他按數值排序
      slots.sort((a, b) => {
        const aVal = parseInt(a.replace(':', ''), 10);
        const bVal = parseInt(b.replace(':', ''), 10);
        const aAfter = a.includes('後');
        const bAfter = b.includes('後');
        if (aAfter && !bAfter) return 1;
        if (!aAfter && bAfter) return -1;
        return aVal - bVal;
      });

      result.days[day] = {
        slots,
        isOff: false,
        rawText: trimmed
      };
    }
  });

  return result;
}
