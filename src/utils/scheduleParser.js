/**
 * 解析美甲師貼上的班表文字
 * 支援格式如：
 * - "5/1 18:00後"
 * - "16號 11:00, 14:00, 17:00後"
 * - "23 (日) 休假"
 * - "5月25號 14:00、17:00後"
 * - 跨多行格式，例如：
 *   06月16日 週二
 *   14:00, 17:00, 18:00, 18:30
 */
export function parseScheduleText(text, defaultYear = new Date().getFullYear(), defaultMonth = new Date().getMonth() + 1) {
  const result = {
    year: defaultYear,
    month: defaultMonth,
    days: {} // 鍵值為日(1-31)，值為 { slots: [], isOff: boolean, rawText: string }
  };

  if (!text || typeof text !== 'string') return result;

  // 1. 嘗試全局解析年份與月份 (例如："2026年5月", "5月預約表", "05 May")
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

  // 用於跟蹤當前活躍的月份（以防文字中動態切換月份）
  let activeMonth = result.month;

  // 2. 逐行解析
  const lines = text.split(/\n/);
  
  // 狀態機：跟蹤前一行未解析完畢的日期（用於跨行解析）
  let pendingDay = null; // { month: number, day: number, rawText: string }

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // 嘗試從當前行解析日期
    const dateParsed = parseDateInLine(trimmed, activeMonth);

    if (dateParsed) {
      // 如果解析出新日期，更新當前活躍月份
      activeMonth = dateParsed.month;
      result.month = activeMonth;

      // 如果有前一個 pending 且無 slots 的日期，保留為空/預設，直接被新日期覆蓋
      // 設定新的 pendingDay
      pendingDay = {
        month: dateParsed.month,
        day: dateParsed.day,
        rawText: trimmed
      };

      // 檢查此行剩餘的文字 (rest) 是否已包含 slots 或休假資訊
      const rest = dateParsed.rest;
      const parsedSlotsOrOff = extractSlotsAndOff(rest, trimmed);

      if (parsedSlotsOrOff.slots.length > 0 || parsedSlotsOrOff.isOff) {
        // 本行已包含完整資訊，直接寫入並清除 pending
        result.days[dateParsed.day] = {
          slots: parsedSlotsOrOff.slots,
          isOff: parsedSlotsOrOff.isOff,
          rawText: trimmed
        };
        pendingDay = null;
      }
    } else {
      // 當前行沒有解析出日期，檢查是否有 pending 的日期
      if (pendingDay) {
        const parsedSlotsOrOff = extractSlotsAndOff(trimmed, pendingDay.rawText + '\n' + trimmed);
        
        if (parsedSlotsOrOff.slots.length > 0 || parsedSlotsOrOff.isOff) {
          // 成功將時段或休假關聯到 pending 的日期
          result.days[pendingDay.day] = {
            slots: parsedSlotsOrOff.slots,
            isOff: parsedSlotsOrOff.isOff,
            rawText: pendingDay.rawText + '\n' + trimmed
          };
          pendingDay = null; // 處理完畢，清除 pending
        }
      }
    }
  });

  return result;
}

/**
 * 從行首嘗試解析日期資訊
 * @returns { { month: number, day: number, rest: string } | null }
 */
function parseDateInLine(trimmed, defaultMonth) {
  // 1. 如果行首就是時間格式 (e.g. 11:00, 14:00)，這肯定不是日期行，直接返回
  if (/^\d{1,2}:\d{2}/.test(trimmed)) {
    return null;
  }

  // 2. 優先匹配包含「月」與「日/號」的明確完整日期 (e.g. "06月16日 週二", "6月16號", "5月25")
  const monthDayMatch = trimmed.match(/^(?:(\d{4})[年/-])?(\d{1,2})\s*月\s*(\d{1,2})\s*(?:日|號)?/);
  if (monthDayMatch) {
    const month = parseInt(monthDayMatch[2], 10);
    const day = parseInt(monthDayMatch[3], 10);
    const rest = trimmed.substring(monthDayMatch[0].length).replace(/^[:：=\-\s]+/, '').trim();
    return { month, day, rest };
  }

  // 3. 匹配 M/D 或 M-D 格式 (e.g. "6/16 週二", "06-16", "週二 06/16")
  const mdMatch = trimmed.match(/^(?:\s*週[一二三四五六日]\s*)?(\d{1,2})[/-](\d{1,2})\b/);
  if (mdMatch) {
    const month = parseInt(mdMatch[1], 10);
    const day = parseInt(mdMatch[2], 10);
    const rest = trimmed.substring(mdMatch[0].length).replace(/^[:：=\-\s]+/, '').trim();
    return { month, day, rest };
  }

  // 4. 匹配單純的日期數字 (e.g. "16號", "16日", "16(二)", "16號(二)", "12:")
  const dayMatch = trimmed.match(/^(\d{1,2})\s*(?:號|日)?(?:\s*[\(（][一二三四五六日a-zA-Z]+[\)）])?\s*(?:號|日|:：|-|=|\b)/);
  if (dayMatch) {
    const day = parseInt(dayMatch[1], 10);
    const rest = trimmed.substring(dayMatch[0].length).replace(/^[:：=\-\s]+/, '').trim();
    return { month: defaultMonth, day, rest };
  }

  return null;
}

/**
 * 從剩餘文字中提取時段與休假狀態
 */
function extractSlotsAndOff(text, rawText) {
  const isOff = /休|休息|休假|off|close/i.test(text);
  if (isOff) {
    return { slots: [], isOff: true };
  }

  const slots = [];
  
  // 1. 先找標點時間 (HH:MM後/起/半/...)
  const timeRegex = /(\d{1,2}:\d{2}(?:\s*[後起])?)/g;
  const matches = text.match(timeRegex);
  
  if (matches && matches.length > 0) {
    matches.forEach(m => {
      let s = m.replace(/\s+/g, '').replace('起', '後');
      slots.push(s);
    });
  } else {
    // 2. 嘗試匹配「XX點」或「XX點半」
    const pointTimeRegex = /(\d{1,2})點(半)?(?:\s*[後起])?/g;
    let pMatch;
    while ((pMatch = pointTimeRegex.exec(text)) !== null) {
      const hour = parseInt(pMatch[1], 10);
      const isHalf = !!pMatch[2];
      const isAfter = pMatch[0].includes('後') || pMatch[0].includes('起');
      const formattedTime = `${hour.toString().padStart(2, '0')}:${isHalf ? '30' : '00'}${isAfter ? '後' : ''}`;
      slots.push(formattedTime);
    }

    // 3. 如果都沒有匹配到，但有數字列表 (例如 "11、14、17")
    if (slots.length === 0) {
      const numListRegex = /\b(\d{1,2})(?:\s*[後起])?\b/g;
      let nMatch;
      while ((nMatch = numListRegex.exec(text)) !== null) {
        const val = parseInt(nMatch[1], 10);
        if (val >= 8 && val <= 22) {
          const isAfter = nMatch[0].includes('後') || nMatch[0].includes('起');
          slots.push(`${val.toString().padStart(2, '0')}:00${isAfter ? '後' : ''}`);
        }
      }
    }
  }

  if (slots.length > 0) {
    // 排序時間
    slots.sort((a, b) => {
      const aVal = parseInt(a.replace(':', ''), 10);
      const bVal = parseInt(b.replace(':', ''), 10);
      const aAfter = a.includes('後');
      const bAfter = b.includes('後');
      if (aAfter && !bAfter) return 1;
      if (!aAfter && bAfter) return -1;
      return aVal - bVal;
    });
  }

  return { slots, isOff: false };
}
