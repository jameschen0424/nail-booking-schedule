import { useRef, useEffect } from 'react';
import QRCodeGen from './Common/QRCodeGen';
import pinkFloralBg from '../assets/pink_floral_bg.png';

export default function PreviewCanvas({ 
  year, 
  month, 
  theme, 
  aspectRatio, // 'story' (9:16), 'post-portrait' (4:5), 'post-square' (1:1)
  fontStyle, // 'serif', 'sans', 'cursive', 'minimal'
  title,
  titleEn,
  brandName, 
  slogan, 
  staffName, 
  subSlogan, 
  notes, 
  qrUrl, 
  qrText, 
  scheduleData, 
  customBgUrl, 
  logoImgUrl,
  hideBrandText,
  exportRef 
}) {

  // 字體配置對照表
  const FONT_STYLES = {
    serif: {
      fontFamily: '"Noto Serif TC", "Playfair Display", Georgia, serif',
      titleFontFamily: '"Playfair Display", "Noto Serif TC", serif',
      scriptFontFamily: '"Playfair Display", serif'
    },
    sans: {
      fontFamily: '"Noto Sans TC", "Outfit", sans-serif',
      titleFontFamily: '"Outfit", "Noto Sans TC", sans-serif',
      scriptFontFamily: '"Outfit", sans-serif'
    },
    cursive: {
      fontFamily: '"Noto Serif TC", "Playfair Display", serif',
      titleFontFamily: '"Dancing Script", "Playfair Display", cursive',
      scriptFontFamily: '"Dancing Script", cursive'
    },
    minimal: {
      fontFamily: '"Noto Sans TC", "Montserrat", sans-serif',
      titleFontFamily: '"Montserrat", "Noto Sans TC", sans-serif',
      scriptFontFamily: '"Montserrat", sans-serif'
    }
  };

  const selectedFont = FONT_STYLES[fontStyle] || FONT_STYLES.serif;

  // 依據時段文字長度動態調整字型大小，避免摺行或溢出
  const getSlotFontSize = (slotText, baseFontSizeStr) => {
    if (!slotText) return baseFontSizeStr;
    if (slotText.length > 8) {
      return `calc(${baseFontSizeStr} * 0.76)`;
    }
    if (slotText.length > 5) {
      return `calc(${baseFontSizeStr} * 0.88)`;
    }
    return baseFontSizeStr;
  };

  // 計算日曆網格所需的日期資料 (提早計算以供縮放係數使用)
  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const getFirstDayOfWeek = (y, m) => new Date(y, m - 1, 1).getDay();

  const totalDays = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfWeek(year, month); // 0 = Sun, 1 = Mon, ...
  const totalCellsCount = firstDayIndex + totalDays;
  const totalRows = Math.ceil(totalCellsCount / 7);
  const isCompactGrid = totalRows >= 6; // 6排月份 (如 2026 年 5 月、8 月)

  // 1. 根據比例動態調整畫布尺寸
  const DIMENSIONS = {
    'story': { width: '540px', height: '960px' },
    'post-portrait': { width: '540px', height: '675px' },
    'post-square': { width: '540px', height: '540px' }
  };
  const canvasSize = DIMENSIONS[aspectRatio] || DIMENSIONS.story;

  // 2. 依據不同高度比例，動態調整間距與字體大小的縮放係數 (預防溢出)
  const isSquare = aspectRatio === 'post-square';
  const isPortrait = aspectRatio === 'post-portrait';
  const isStory = aspectRatio === 'story';

  // 縮放設定
  const scale = {
    headerMarginBottom: isStory ? (isCompactGrid ? '8px' : '16px') : isPortrait ? (isCompactGrid ? '2px' : '4px') : (isCompactGrid ? '1px' : '2px'),
    headerMarginTop: isStory ? (isCompactGrid ? '2px' : '10px') : isPortrait ? '0px' : '0px',
    monthFontSize: isStory ? (isCompactGrid ? '50px' : '60px') : isPortrait ? (isCompactGrid ? '34px' : '38px') : (isCompactGrid ? '24px' : '28px'),
    yearFontSize: isStory ? '13px' : isPortrait ? '10px' : '9px',
    enMonthFontSize: isStory ? '20px' : isPortrait ? '14px' : '12px',
    mainTitleFontSize: isStory ? (isCompactGrid ? '20px' : '26px') : isPortrait ? (isCompactGrid ? '14px' : '16px') : (isCompactGrid ? '12px' : '13px'),
    subSloganFontSize: isStory ? '11px' : isPortrait ? '8.5px' : '7.5px',
    staffNameFontSize: isStory ? '13px' : isPortrait ? '10px' : '8.5px',
    staffNamePadding: isStory ? '4px 16px' : isPortrait ? '2px 8px' : '1px 6px',
    
    calendarPadding: isStory ? (isCompactGrid ? '8px' : '10px') : isPortrait ? (isCompactGrid ? '6px' : '8px') : (isCompactGrid ? '4px' : '6px'),
    calendarHeaderFontSize: isStory ? '10px' : isPortrait ? '9px' : '8px',
    
    dayFontSize: isStory ? (isCompactGrid ? '11px' : '13px') : isPortrait ? (isCompactGrid ? '9.5px' : '10.5px') : (isCompactGrid ? '8.5px' : '9.5px'),
    slotFontSize: isStory ? (isCompactGrid ? '8.5px' : '10px') : isPortrait ? (isCompactGrid ? '8px' : '8.5px') : (isCompactGrid ? '7px' : '7.5px'),
    slotPadding: isStory ? (isCompactGrid ? '1.5px 3px' : '2px 4px') : isPortrait ? (isCompactGrid ? '1px 1.5px' : '1.5px 2px') : (isCompactGrid ? '0.5px 1px' : '1px 2px'),
    cellPadding: isStory ? (isCompactGrid ? '2.5px' : '4px') : isPortrait ? '2px' : '1px',
    
    footerHeight: isStory ? (isCompactGrid ? '102px' : '118px') : isPortrait ? (isCompactGrid ? '80px' : '90px') : (isCompactGrid ? '70px' : '78px'),
    footerNotesFontSize: isStory ? (isCompactGrid ? '9px' : '10.5px') : isPortrait ? '8.5px' : '7.5px',
    footerNotesLineHeight: isStory ? (isCompactGrid ? '1.35' : '1.5') : isPortrait ? '1.3' : '1.15',
    footerLogoFontSize: isStory ? '14px' : isPortrait ? '10px' : '8.5px',
    footerSloganFontSize: isStory ? '8.5px' : isPortrait ? '7.5px' : '6px',
    footerLogoIconSize: isStory ? '22px' : isPortrait ? '16px' : '12px',
    qrSize: isStory ? (isCompactGrid ? '48px' : '56px') : isPortrait ? '40px' : '34px',
    qrLabelFontSize: isStory ? '9px' : isPortrait ? '7.5px' : '6.5px',
    qrDescFontSize: isStory ? '7.5px' : isPortrait ? '7px' : '6.2px'
  };

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ day: null, empty: true });
  }
  for (let d = 1; d <= totalDays; d++) {
    const dayData = scheduleData[d] || { slots: [], isOff: false };
    calendarCells.push({
      day: d,
      empty: false,
      slots: dayData.slots || [],
      isOff: dayData.isOff || false
    });
  }

  // 預約須知換行處理
  const notesList = notes ? notes.split('\n').filter(n => n.trim()) : [];

  const themeColors = theme.colors;



  // 背景圖風格
  const backgroundStyle = customBgUrl ? {
    backgroundImage: `url(${customBgUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {
    backgroundColor: themeColors.background,
    backgroundImage: theme.id === 'pinkFloral'
      ? `url(${pinkFloralBg})`
      : theme.id === 'sageGreen' 
      ? 'radial-gradient(circle at 20% 20%, #F5F7F6 0%, #EAEFEF 100%)'
      : theme.id === 'beigeLuxury'
      ? 'linear-gradient(135deg, #FAF7F2 0%, #F4ECE1 100%)'
      : theme.id === 'turquoiseGold'
      ? 'radial-gradient(circle at 80% 80%, #F2F8F7 0%, #DCEBE9 100%)'
      : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  // 載入 Google Fonts
  useEffect(() => {
    const linkId = 'google-fonts-preview';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;700&family=Dancing+Script:wght@400;700&family=Montserrat:wght@400;500;700&family=Great+Vibes&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const getEnglishMonthShort = (m) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[m - 1] || '';
  };

  return (
    <div 
      ref={exportRef}
      id="booking-schedule-canvas"
      className={`preview-canvas theme-${theme.id} aspect-${aspectRatio}`}
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        position: 'relative',
        boxSizing: 'border-box',
        fontFamily: selectedFont.fontFamily,
        color: themeColors.textPrimary,
        overflow: 'hidden',
        userSelect: 'none',
        boxShadow: '0 24px 60px rgba(108, 83, 63, 0.08)',
        borderRadius: '24px',
        ...backgroundStyle
      }}
    >
      {/* 1. 主題向量裝飾背景 */}
      {!customBgUrl && theme.id !== 'pinkFloral' && (
        <>
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: isStory ? '180px' : isPortrait ? '140px' : '110px', 
              height: isStory ? '180px' : isPortrait ? '140px' : '110px', 
              pointerEvents: 'none',
              opacity: isSquare ? 0.7 : 1
            }}
            dangerouslySetInnerHTML={{ __html: theme.decorations.topLeft }}
          />
          <div 
            style={{ 
              position: 'absolute', 
              bottom: 0, 
              right: 0, 
              width: isStory ? '180px' : isPortrait ? '140px' : '110px', 
              height: isStory ? '180px' : isPortrait ? '140px' : '110px', 
              pointerEvents: 'none',
              opacity: isSquare ? 0.7 : 1
            }}
            dangerouslySetInnerHTML={{ __html: theme.decorations.bottomRight }}
          />
        </>
      )}

      {/* 2. 海洋大理石與粉色櫻花的金色框線 */}
      {!customBgUrl && theme.id === 'turquoiseGold' && (
        <div style={{
          position: 'absolute',
          top: isStory ? '12px' : '8px',
          left: isStory ? '12px' : '8px',
          right: isStory ? '12px' : '8px',
          bottom: isStory ? '12px' : '8px',
          border: `1.5px solid ${themeColors.accent}`,
          opacity: 0.5,
          pointerEvents: 'none',
          borderRadius: '4px'
        }} />
      )}

      {/* 3. 主版面 */}
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: isStory ? '24px' : isPortrait ? '16px' : '12px',
        boxSizing: 'border-box',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 2
      }}>
        {/* ================= 主日曆版面 ================= */}
        <div style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Header 區塊 - 左右精緻排版，比照設計圖 */}
          <div style={{ 
            display: 'flex',
            flexShrink: 0,
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: scale.headerMarginBottom,
            marginTop: scale.headerMarginTop,
            boxSizing: 'border-box'
          }}>
            {/* 左側：年份與大月份、英月重疊排版 */}
            <div style={{ 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start',
              width: isStory ? '100px' : isPortrait ? '80px' : '70px',
              height: isStory ? '90px' : isPortrait ? '70px' : '60px',
              justifyContent: 'center'
            }}>
              <span style={{ 
                fontSize: isStory ? '11px' : '9px', 
                opacity: 0.6, 
                letterSpacing: '1.5px',
                color: themeColors.textPrimary,
                fontFamily: selectedFont.titleFontFamily,
                marginBottom: '-4px',
                fontWeight: '600'
              }}>
                {year}
              </span>
              <span style={{ 
                fontSize: isStory ? '64px' : isPortrait ? '48px' : '38px', 
                fontWeight: '700', 
                lineHeight: 0.9, 
                color: themeColors.textPrimary,
                fontFamily: selectedFont.titleFontFamily
              }}>
                {month.toString().padStart(2, '0')}
              </span>
              <span style={{ 
                position: 'absolute',
                left: isStory ? '24px' : isPortrait ? '18px' : '14px',
                bottom: isStory ? '2px' : isPortrait ? '2px' : '1px',
                fontSize: isStory ? '36px' : isPortrait ? '28px' : '22px', 
                fontFamily: '"Great Vibes", "Dancing Script", cursive', 
                color: theme.id === 'pinkFloral' ? themeColors.textSecondary : themeColors.accent,
                lineHeight: 1,
                textShadow: '1px 1px 0px rgba(255, 255, 255, 0.8)',
                transform: 'rotate(-8deg) translateY(-2px)',
                transformOrigin: 'left bottom'
              }}>
                {getEnglishMonthShort(month)}
              </span>
            </div>

            {/* 中間：標題、美甲師名稱與副標題 */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center',
              padding: '0 8px'
            }}>
              {/* 美甲預約表 */}
              <h1 style={{ 
                fontSize: scale.monthFontSize === '60px' ? '28px' : scale.mainTitleFontSize, 
                fontWeight: '700', 
                margin: 0, 
                letterSpacing: '3px',
                color: themeColors.textPrimary,
                lineHeight: 1.1,
                fontFamily: selectedFont.titleFontFamily
              }}>
                {title}
              </h1>

              {/* NAIL APPOINTMENT SCHEDULE */}
              {titleEn && (
                <>
                  <div style={{ 
                    fontSize: isStory ? '8px' : '7.5px', 
                    letterSpacing: '1.5px', 
                    opacity: 0.7, 
                    textTransform: 'uppercase',
                    color: themeColors.textSecondary,
                    marginTop: '2px',
                    marginBottom: '2px',
                    fontWeight: '600'
                  }}>
                    {titleEn}
                  </div>
                  <div style={{
                    fontSize: isStory ? '8px' : '6px',
                    color: theme.id === 'pinkFloral' ? themeColors.textSecondary : themeColors.accent,
                    opacity: 0.6,
                    margin: '1px 0 3px 0',
                    letterSpacing: '3px',
                    fontWeight: 'normal'
                  }}>
                    ✦ ✧ ✦
                  </div>
                </>
              )}

              {/* 副標語 */}
              {subSlogan && (
                <div style={{ 
                  fontSize: scale.subSloganFontSize, 
                  opacity: 0.8, 
                  fontStyle: 'italic',
                  marginBottom: '6px',
                  color: themeColors.textSecondary
                }}>
                  {subSlogan}
                </div>
              )}

              {/* 美甲師名稱 pill tag */}
              <div>
                <span style={{
                  fontSize: isStory ? '11px' : '9.5px',
                  fontWeight: 'bold',
                  padding: isStory ? '3px 14px' : '2px 10px',
                  borderRadius: '20px',
                  color: theme.id === 'pinkFloral' ? themeColors.textPrimary : '#FFFFFF',
                  backgroundColor: theme.id === 'pinkFloral' ? '#FADCE1' : themeColors.headerBg,
                  letterSpacing: '1px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                  💗 {staffName}可預約時段 💗
                </span>
              </div>
            </div>

            {/* 右側：精緻植物葉片線條插圖以點綴並維持標題置中 */}
            <div style={{
              width: isStory ? '100px' : isPortrait ? '80px' : '70px',
              height: isStory ? '90px' : isPortrait ? '70px' : '60px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
              position: 'relative'
            }}>
              <div style={{
                width: isStory ? '60px' : isPortrait ? '48px' : '40px',
                height: isStory ? '60px' : isPortrait ? '48px' : '40px',
                opacity: 0.45,
                color: theme.id === 'pinkFloral' ? themeColors.textSecondary : themeColors.accent,
                transform: 'rotate(-15deg)',
                pointerEvents: 'none'
              }}>
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.3">
                  {/* Stem curving from bottom-left to top-right */}
                  <path d="M 15 85 Q 50 65, 80 20" strokeLinecap="round" />
                  {/* Leaves branching off */}
                  <path d="M 35 68 C 22 60, 18 45, 24 38 C 28 35, 34 42, 38 52" strokeLinecap="round" />
                  <path d="M 45 58 C 58 55, 66 40, 60 32 C 55 28, 48 35, 46 45" strokeLinecap="round" />
                  <path d="M 58 42 C 48 35, 42 20, 48 12 C 52 8, 58 15, 60 25" strokeLinecap="round" />
                  <path d="M 80 20 C 82 12, 75 5, 68 8 C 65 10, 68 18, 80 20" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

              {/* Calendar Grid 區塊 */}
              <div style={{
                flex: '1 1 0%',
                minHeight: 0,
                backgroundColor: themeColors.cardBg,
                border: `1px solid ${themeColors.border}90`,
                borderRadius: '16px',
                padding: scale.calendarPadding,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(108, 83, 63, 0.04)',
                overflow: 'hidden'
              }}>
                {/* 星期 Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  backgroundColor: themeColors.headerBg,
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '4px 0',
                  marginBottom: isStory ? '8px' : '4px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(108, 83, 63, 0.05)',
                  flexShrink: 0
                }}>
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((w, idx) => {
                    const weekCh = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][idx];
                    return (
                      <div key={w} style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        color: '#FFFFFF',
                        borderRight: idx < 6 ? '1px solid rgba(255,255,255,0.3)' : 'none'
                      }}>
                        <span style={{ 
                          fontSize: scale.calendarHeaderFontSize, 
                          fontWeight: '700', 
                          color: '#FFFFFF',
                          lineHeight: 1.1
                        }}>{w}</span>
                        {!isSquare && (
                          <span style={{ 
                            fontSize: '7.5px', 
                            opacity: 0.95,
                            color: '#FFFFFF',
                            lineHeight: 1
                          }}>{weekCh}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

            {/* 日曆網格格子 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridTemplateRows: `repeat(${Math.ceil(calendarCells.length / 7)}, 1fr)`,
              flex: '1 1 0%',
              minHeight: 0,
              gap: '1px',
              backgroundColor: theme.id === 'pinkFloral' ? '#FADCE1' : themeColors.border,
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {calendarCells.map((cell, index) => {
                if (cell.empty) {
                  return <div key={`empty-${index}`} style={{ backgroundColor: 'transparent' }} />;
                }

                const isTodayOff = cell.isOff;
                const dayOfWeek = index % 7;
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                // 當日班表為 3 個（含）以下時，採用單欄位顯示（一行一個）；大於 3 個時，改用雙欄位並排顯示（一行兩個），最多顯示 6 個
                const useTwoColumns = cell.slots.length > 3;
                const maxVisibleSlots = useTwoColumns ? 6 : 3;
                const displayedSlots = cell.slots.slice(0, maxVisibleSlots);
                const hasMoreSlots = cell.slots.length > maxVisibleSlots;

                return (
                    <div 
                      key={`day-${cell.day}`} 
                      style={{
                        padding: scale.cellPadding,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'stretch',
                        backgroundColor: isTodayOff 
                          ? (theme.id === 'pinkFloral' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.45)')
                          : 'rgba(255, 255, 255, 0.9)',
                        opacity: isTodayOff ? 0.85 : 1,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      {/* 日期標題 */}
                      <div style={{
                        fontSize: scale.dayFontSize,
                        fontWeight: '700',
                        marginBottom: '2px',
                        paddingLeft: '2px',
                        color: themeColors.textPrimary,
                        fontFamily: selectedFont.fontFamily
                      }}>
                        {cell.day}
                      </div>

                      {/* 日期時段或休假 */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        justifyContent: isTodayOff ? 'center' : 'flex-start',
                        alignItems: 'center',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}>
                        {isTodayOff ? (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: themeColors.textSecondary,
                            height: '100%',
                            width: '100%',
                            gap: isStory ? '4px' : '2px',
                            opacity: 0.75
                          }}>
                            <span style={{
                              fontSize: isStory ? '10.5px' : isPortrait ? '9px' : '8px',
                              fontWeight: 'bold',
                              fontFamily: selectedFont.fontFamily,
                              lineHeight: 1
                            }}>
                              休假
                            </span>
                            {theme.decorations.leafIcon && (
                              <div 
                                style={{ 
                                  width: isStory ? '14px' : isPortrait ? '12px' : '10px', 
                                  height: isStory ? '14px' : isPortrait ? '12px' : '10px',
                                  color: themeColors.textSecondary,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                dangerouslySetInnerHTML={{ __html: theme.decorations.leafIcon }}
                              />
                            )}
                          </div>
                        ) : useTwoColumns ? (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: isSquare ? '1px' : '1.5px',
                             width: '100%',
                            boxSizing: 'border-box'
                          }}>
                            {displayedSlots.map((slot, sIdx) => {
                              const slotFontSize = `calc(${scale.slotFontSize} * 0.9)`;
                              const dynamicFontSize = getSlotFontSize(slot, slotFontSize);
                              const slotPadding = isSquare ? '1px 1px' : '1px 1.5px';
                              return (
                                <div 
                                  key={sIdx} 
                                  style={{
                                    fontSize: dynamicFontSize,
                                    lineHeight: '1.15',
                                    padding: slotPadding,
                                    borderRadius: '20px',
                                    backgroundColor: themeColors.slotBg,
                                    color: themeColors.slotText,
                                    width: '100%',
                                    textAlign: 'center',
                                    boxSizing: 'border-box',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {slot}
                                </div>
                              );
                            })}
                            {hasMoreSlots && (
                              <div style={{ 
                                gridColumn: 'span 2', 
                                fontSize: '7px', 
                                opacity: 0.5, 
                                textAlign: 'center', 
                                lineHeight: 1,
                                marginTop: '1px'
                              }}>
                                •••
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            width: '100%',
                            boxSizing: 'border-box',
                            alignItems: 'center'
                          }}>
                            {displayedSlots.map((slot, sIdx) => {
                              const dynamicFontSize = getSlotFontSize(slot, scale.slotFontSize);
                              return (
                                <div 
                                  key={sIdx} 
                                  style={{
                                    fontSize: dynamicFontSize,
                                    lineHeight: '1.2',
                                    padding: scale.slotPadding,
                                    borderRadius: '20px',
                                    backgroundColor: themeColors.slotBg,
                                    color: themeColors.slotText,
                                    width: '100%',
                                    textAlign: 'center',
                                    boxSizing: 'border-box',
                                    fontWeight: '600',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'block'
                                  }}
                                >
                                  {slot}
                                </div>
                              );
                            })}
                            {hasMoreSlots && (
                              <div style={{ fontSize: '7px', opacity: 0.5, textAlign: 'center', lineHeight: 1 }}>
                                •••
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                );
              })}
            </div>
          </div>

          {/* ================= C. 水平排版時的底部資訊欄 (對稱設計，無邊框卡片，比照設計圖) ================= */}
          <div style={{
            display: 'flex',
            flexShrink: 0,
            justifyContent: 'space-between',
            alignItems: 'stretch',
            marginTop: isStory ? '14px' : isPortrait ? '10px' : '8px',
            backgroundColor: themeColors.cardBg,
            border: `1.5px solid ${themeColors.border}`,
            borderRadius: '18px',
            padding: isStory ? '8px 16px' : isPortrait ? '10px 12px' : '8px 10px',
            boxShadow: '0 8px 30px rgba(108, 83, 63, 0.04)',
            height: scale.footerHeight,
            boxSizing: 'border-box',
            width: '100%',
            gap: isStory ? '16px' : '10px',
            position: 'relative'
          }}>
            {/* 1. 左側：預約須知 */}
            <div style={{
              flex: '1 1 0px',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <span style={{ 
                  color: themeColors.textPrimary,
                  fontSize: isStory ? '10.5px' : isPortrait ? '9px' : '8px',
                  fontWeight: '700',
                  letterSpacing: '1px'
                }}>
                  ✦ 預約須知
                </span>
              </div>
              <ul style={{ 
                margin: 0, 
                padding: '0 0 0 10px', 
                fontSize: scale.footerNotesFontSize, 
                lineHeight: scale.footerNotesLineHeight,
                opacity: 0.9,
                listStyleType: 'disc',
                color: themeColors.textPrimary
              }}>
                {notesList.slice(0, isSquare ? 2 : 4).map((item, idx) => (
                  <li key={idx} style={{ 
                    margin: 0,
                    padding: 0,
                    marginBottom: '1.5px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.2
                  }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* 分隔線 (Divider) */}
            <div style={{
              width: '1px',
              backgroundColor: `${themeColors.border}E0`,
              margin: '6px 0'
            }} />

            {/* 2. 中間：品牌商標 Logo */}
            <div style={{
              flex: isStory ? '0 0 100px' : isPortrait ? '0 0 90px' : '0 0 80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              overflow: 'hidden',
              padding: '0 4px'
            }}>
              <div style={{ 
                width: hideBrandText 
                  ? '70%' 
                  : (logoImgUrl ? `calc(${scale.footerLogoIconSize} * 1.5)` : `calc(${scale.footerLogoIconSize} * 1.8)`), 
                height: hideBrandText 
                  ? '70%' 
                  : (logoImgUrl ? `calc(${scale.footerLogoIconSize} * 1.5)` : `calc(${scale.footerLogoIconSize} * 1.8)`), 
                color: themeColors.textSecondary, 
                marginBottom: hideBrandText ? '0px' : '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {logoImgUrl ? (
                  <img src={logoImgUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ width: '100%', height: '100%' }}>
                    <path d="M 50 90 C 50 70, 52 50, 45 20" strokeLinecap="round" />
                    <path d="M 49 70 C 40 68, 32 60, 35 52 C 38 48, 46 52, 49.5 60" strokeLinecap="round" />
                    <path d="M 50 65 C 60 63, 68 55, 65 47 C 62 43, 54 47, 50.5 55" strokeLinecap="round" />
                    <path d="M 48 48 C 38 46, 30 38, 33 30 C 36 26, 44 30, 47.5 38" strokeLinecap="round" />
                    <path d="M 47 43 C 57 41, 65 33, 62 25 C 59 21, 51 25, 47.5 33" strokeLinecap="round" />
                    <path d="M 45 20 C 43 12, 47 5, 52 10 C 55 14, 51 18, 45 20" strokeLinecap="round" />
                    <path d="M 23 28 L 25 30 L 28 31 L 25 32 L 23 34 L 21 32 L 18 31 L 21 30 Z" fill="currentColor" opacity="0.8" stroke="none" />
                    <path d="M 75 42 L 76 44 L 79 45 L 76 46 L 75 48 L 74 46 L 71 45 L 74 44 Z" fill="currentColor" opacity="0.8" stroke="none" />
                    <path d="M 32 10 L 33 11.5 L 35 12 L 33 12.5 L 32 14 L 31 12.5 L 29 12 L 31 11.5 Z" fill="currentColor" opacity="0.8" stroke="none" />
                  </svg>
                )}
              </div>
              {!hideBrandText && (
                <>
                  <h3 style={{ 
                    fontSize: theme.id === 'pinkFloral' ? `calc(${scale.footerLogoFontSize} * 1.35)` : scale.footerLogoFontSize, 
                    fontWeight: theme.id === 'pinkFloral' ? 'normal' : 'bold', 
                    margin: '0 0 1px 0', 
                    letterSpacing: '1px',
                    whiteSpace: 'nowrap',
                    color: themeColors.textPrimary,
                    fontFamily: theme.id === 'pinkFloral' ? '"Great Vibes", "Dancing Script", cursive' : selectedFont.titleFontFamily
                  }}>
                    {brandName}
                  </h3>
                  <p style={{ 
                    fontSize: scale.footerSloganFontSize, 
                    margin: 0, 
                    opacity: 0.8, 
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                    color: themeColors.textSecondary
                  }}>
                    {slogan}
                  </p>
                </>
              )}
            </div>

            {/* 分隔線 (Divider) */}
            <div style={{
              width: '1px',
              backgroundColor: `${themeColors.border}E0`,
              margin: '6px 0'
            }} />

            {/* 3. 右側：立即預約 QR Code */}
            <div style={{
              flex: '1 1 0px',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              overflow: 'hidden',
              paddingLeft: isStory ? '8px' : '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <span style={{ 
                  color: themeColors.textPrimary,
                  fontSize: isStory ? '10.5px' : isPortrait ? '9px' : '8px',
                  fontWeight: '700',
                  letterSpacing: '1px'
                }}>
                  ✦ 立即預約
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isStory ? '8px' : '4px',
                width: '100%'
              }}>
                <div style={{
                  border: `1px solid ${themeColors.border}80`,
                  padding: '1px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  flexShrink: 0
                }}>
                  <QRCodeGen url={qrUrl} color={themeColors.textPrimary} size={scale.qrSize} />
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  minWidth: 0,
                  textAlign: 'left'
                }}>
                  <p style={{ 
                    fontSize: scale.qrDescFontSize, 
                    margin: 0, 
                    opacity: 0.9, 
                    lineHeight: 1.2,
                    fontWeight: '500',
                    color: themeColors.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    wordBreak: 'break-all',
                    whiteSpace: 'pre-line'
                  }}>
                    {qrText}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 底部小字 */}
          <div style={{
            textAlign: 'center',
            flexShrink: 0,
            fontSize: isStory ? '8px' : '7px',
            opacity: 0.4,
            marginTop: '4px',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            — Created via Beauty Appointment Planner —
          </div>
        </div>
      </div>
    </div>
  );
}
