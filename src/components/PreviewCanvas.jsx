import { useRef, useEffect } from 'react';
import QRCodeGen from './Common/QRCodeGen';

export default function PreviewCanvas({ 
  year, 
  month, 
  theme, 
  layout, // 'sidebar' or 'footer'
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
    calendarMinHeight: isStory ? (isCompactGrid ? '400px' : '440px') : isPortrait ? (isCompactGrid ? '250px' : '280px') : (isCompactGrid ? '190px' : '210px'),
    calendarHeaderFontSize: isStory ? '10px' : isPortrait ? '9px' : '8px',
    
    dayFontSize: isStory ? (isCompactGrid ? '11px' : '13px') : isPortrait ? (isCompactGrid ? '9.5px' : '10.5px') : (isCompactGrid ? '8.5px' : '9.5px'),
    slotFontSize: isStory ? (isCompactGrid ? '8.5px' : '10px') : isPortrait ? (isCompactGrid ? '8px' : '8.5px') : (isCompactGrid ? '7px' : '7.5px'),
    slotPadding: isStory ? (isCompactGrid ? '1.5px 3px' : '2px 4px') : isPortrait ? (isCompactGrid ? '1px 1.5px' : '1.5px 2px') : (isCompactGrid ? '0.5px 1px' : '1px 2px'),
    cellPadding: isStory ? (isCompactGrid ? '2.5px' : '4px') : isPortrait ? '2px' : '1px',
    
    footerHeight: isStory ? (isCompactGrid ? '100px' : '115px') : isPortrait ? (isCompactGrid ? '70px' : '80px') : (isCompactGrid ? '50px' : '60px'),
    footerNotesFontSize: isStory ? (isCompactGrid ? '9px' : '10.5px') : isPortrait ? '8.5px' : '7px',
    footerNotesLineHeight: isStory ? (isCompactGrid ? '1.35' : '1.5') : isPortrait ? '1.3' : '1.15',
    footerLogoFontSize: isStory ? '14px' : isPortrait ? '10px' : '8.5px',
    footerSloganFontSize: isStory ? '8.5px' : isPortrait ? '7.5px' : '6px',
    footerLogoIconSize: isStory ? '22px' : isPortrait ? '16px' : '12px',
    qrSize: isStory ? (isCompactGrid ? '48px' : '56px') : isPortrait ? '38px' : '30px',
    qrLabelFontSize: isStory ? '9px' : isPortrait ? '7.5px' : '6.5px',
    qrDescFontSize: isStory ? '7.5px' : isPortrait ? '6.5px' : '5px'
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

  const isSidebarLayout = layout === 'sidebar';

  // 背景圖風格
  const backgroundStyle = customBgUrl ? {
    backgroundImage: `url(${customBgUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {
    backgroundColor: themeColors.background,
    backgroundImage: theme.id === 'sageGreen' 
      ? 'radial-gradient(circle at 20% 20%, #F5F7F6 0%, #EAEFEF 100%)'
      : theme.id === 'beigeLuxury'
      ? 'linear-gradient(135deg, #FAF7F2 0%, #F4ECE1 100%)'
      : theme.id === 'turquoiseGold'
      ? 'radial-gradient(circle at 80% 80%, #F2F8F7 0%, #DCEBE9 100%)'
      : theme.id === 'pinkFloral'
      ? 'linear-gradient(180deg, #FDF7F8 0%, #FAF0F2 100%)'
      : 'none'
  };

  // 載入 Google Fonts
  useEffect(() => {
    const linkId = 'google-fonts-preview';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Zhi+Mang+Xing&family=Ma+Shan+Zheng&family=Long+Cang&family=ZCOOL+XiaoWei&family=ZCOOL+QingKe+HuangYou&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;700&family=Dancing+Script:wght@400;700&family=Montserrat:wght@400;500;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Cinzel:wght@400;600;700&family=Great+Vibes&family=Sacramento&family=Bodoni+Moda:ital,wght@0,400;0,700;1,400&display=swap';
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
      className={`preview-canvas theme-${theme.id} layout-${layout} aspect-${aspectRatio}`}
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        position: 'relative',
        boxSizing: 'border-box',
        fontFamily: selectedFont.fontFamily,
        color: themeColors.textPrimary,
        overflow: 'hidden',
        userSelect: 'none',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        borderRadius: '8px',
        ...backgroundStyle
      }}
    >
      {/* 1. 主題向量裝飾背景 */}
      {!customBgUrl && (
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
      {!customBgUrl && (theme.id === 'turquoiseGold' || theme.id === 'pinkFloral') && (
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
        flexDirection: isSidebarLayout ? 'row' : 'column',
        position: 'relative',
        zIndex: 2
      }}>
        
        {/* ================= A. 側欄排版時的左側資訊欄 ================= */}
        {isSidebarLayout && (
          <div style={{
            width: isStory ? '135px' : isPortrait ? '125px' : '115px',
            marginRight: isStory ? '16px' : '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            boxSizing: 'border-box'
          }}>
            {/* 左側頂部 品牌名/標語 */}
            <div style={{
              border: `1px solid ${themeColors.border}`,
              backgroundColor: themeColors.cardBg,
              padding: isStory ? '16px 10px' : isPortrait ? '10px 6px' : '8px 4px',
              borderRadius: isStory ? '60px 60px 10px 10px' : '40px 40px 8px 8px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.01)',
              width: '100%'
            }}>
              <div style={{ 
                width: hideBrandText 
                  ? (isStory ? '85px' : '65px') 
                  : (logoImgUrl ? (isStory ? '45px' : '32px') : (isStory ? '32px' : '22px')), 
                height: hideBrandText 
                  ? (isStory ? '85px' : '65px') 
                  : (logoImgUrl ? (isStory ? '45px' : '32px') : (isStory ? '32px' : '22px')), 
                color: themeColors.accent, 
                marginBottom: hideBrandText ? '0px' : (isStory ? '8px' : '4px'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {logoImgUrl ? (
                  <img src={logoImgUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 2C8 6 4 10 4 15a8 8 0 0 0 16 0c0-5-4-9-8-13Z" />
                  </svg>
                )}
              </div>
              {!hideBrandText && (
                <>
                  <h3 style={{ 
                    fontSize: isStory ? '15px' : '13px', 
                    fontWeight: 'bold', 
                    margin: '0 0 4px 0', 
                    letterSpacing: '1px' 
                  }}>
                    {brandName}
                  </h3>
                  <p style={{ fontSize: isStory ? '9px' : '8px', margin: 0, opacity: 0.8, lineHeight: 1.2 }}>
                    {slogan}
                  </p>
                </>
              )}
            </div>

            {/* 左側中部 預約須知 */}
            <div style={{
              margin: isStory ? '16px 0' : '8px 0',
              border: `1px solid ${themeColors.border}`,
              backgroundColor: themeColors.cardBg,
              padding: isStory ? '12px 8px' : '8px 6px',
              borderRadius: '8px',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 10px rgba(0,0,0,0.01)',
              overflow: 'hidden'
            }}>
              <h4 style={{ 
                fontSize: isStory ? '11px' : '10px', 
                margin: '0 0 6px 0', 
                textAlign: 'center', 
                borderBottom: `1px solid ${themeColors.border}`,
                paddingBottom: '4px',
                letterSpacing: '1px',
                fontWeight: 'bold'
              }}>
                ✦ 預約須知 ✦
              </h4>
              <ul style={{ 
                margin: 0, 
                padding: '0 4px 0 12px', 
                fontSize: isStory ? '9.5px' : isPortrait ? '8px' : '7.5px', 
                lineHeight: 1.4,
                opacity: 0.9,
                listStyleType: 'disc',
                overflow: 'hidden'
              }}>
                {notesList.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: isStory ? '5px' : '3px' }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* 左側底部 QR Code 預約 */}
            <div style={{
              border: `1px solid ${themeColors.border}`,
              backgroundColor: themeColors.cardBg,
              padding: isStory ? '12px 6px' : '8px 4px',
              borderRadius: '8px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.01)'
            }}>
              <span style={{ 
                fontSize: isStory ? '10px' : '8px', 
                fontWeight: 'bold', 
                marginBottom: '4px', 
                color: themeColors.textPrimary 
              }}>
                立即預約
              </span>
              <QRCodeGen url={qrUrl} color={themeColors.textPrimary} size={isStory ? 65 : 50} />
              <p style={{ fontSize: isStory ? '7.5px' : '6px', margin: '4px 0 0 0', opacity: 0.8, lineHeight: 1.2 }}>
                {qrText}
              </p>
            </div>
          </div>
        )}

        {/* ================= B. 右側主日曆版面 (或在水平版面下之主版面) ================= */}
        <div style={{
          flexGrow: 1,
          display: 'grid',
          gridTemplateRows: isSidebarLayout ? 'auto 1fr' : 'auto 1fr auto',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Header 區塊 */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: scale.headerMarginBottom,
            marginTop: scale.headerMarginTop
          }}>
            {/* 年月份顯示 */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ 
                fontSize: scale.monthFontSize, 
                fontWeight: '700', 
                lineHeight: 1, 
                color: themeColors.textPrimary,
                fontFamily: selectedFont.titleFontFamily
              }}>
                {month.toString().padStart(2, '0')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: scale.yearFontSize, opacity: 0.7, letterSpacing: '1px' }}>{year}</span>
                <span style={{ 
                  fontSize: scale.enMonthFontSize, 
                  fontFamily: selectedFont.scriptFontFamily, 
                  fontStyle: fontStyle === 'serif' || fontStyle === 'cursive' ? 'italic' : 'normal',
                  color: themeColors.accent,
                  lineHeight: 1
                }}>
                  {getEnglishMonthShort(month)}
                </span>
              </div>
            </div>

            {/* 標題與標語 */}
            <h1 style={{ 
              fontSize: scale.mainTitleFontSize, 
              fontWeight: '700', 
              margin: isStory ? '6px 0 2px 0' : '2px 0 1px 0', 
              letterSpacing: '3px',
              color: themeColors.textPrimary
            }}>
              {title}
            </h1>

            {/* 英文副標題 */}
            {titleEn && (
              <div style={{ 
                fontSize: isStory ? '8.5px' : '7.5px', 
                letterSpacing: '1.5px', 
                opacity: 0.8, 
                textTransform: 'uppercase',
                color: themeColors.textSecondary,
                marginBottom: isStory ? '6px' : '3px',
                marginTop: '-2px'
              }}>
                {titleEn}
              </div>
            )}
            
            {/* 美麗，從指尖開始 */}
            <div style={{ 
              fontSize: scale.subSloganFontSize, 
              opacity: 0.8, 
              fontStyle: 'italic', 
              marginBottom: isStory ? '8px' : '4px' 
            }}>
              {subSlogan}
            </div>

            {/* 美甲師預約時段 Banner */}
            <div style={{ display: 'inline-block', position: 'relative' }}>
              <div style={{
                fontSize: scale.staffNameFontSize,
                fontWeight: 'bold',
                padding: scale.staffNamePadding,
                border: `1px solid ${themeColors.accent}`,
                borderRadius: '20px',
                color: themeColors.textPrimary,
                backgroundColor: themeColors.cardBg,
                letterSpacing: '1.5px'
              }}>
                ✦ {staffName} 可預約時段 ✦
              </div>
            </div>
          </div>

          {/* Calendar Grid 區塊 */}
          <div style={{
            height: '100%',
            minHeight: 0,
            backgroundColor: themeColors.cardBg,
            border: `1px solid ${themeColors.border}`,
            borderRadius: '8px',
            padding: scale.calendarPadding,
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            boxShadow: '0 6px 15px rgba(0,0,0,0.01)'
          }}>
            {/* 星期 Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: `1px solid ${themeColors.border}`,
              paddingBottom: '4px',
              marginBottom: '4px',
              textAlign: 'center'
            }}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((w, idx) => {
                const isWeekend = idx === 0 || idx === 6;
                const weekCh = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][idx];
                return (
                  <div key={w} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: scale.calendarHeaderFontSize, 
                      fontWeight: 'bold', 
                      opacity: isWeekend ? 0.9 : 0.6,
                      color: isWeekend ? '#D9534F' : themeColors.textPrimary
                    }}>{w}</span>
                    {!isSquare && (
                      <span style={{ 
                        fontSize: '8px', 
                        opacity: isWeekend ? 0.9 : 0.6,
                        color: isWeekend ? '#D9534F' : themeColors.textPrimary
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
              minHeight: 0,
              height: '100%',
              gap: isSquare ? '2px' : '4px'
            }}>
              {calendarCells.map((cell, index) => {
                if (cell.empty) {
                  return <div key={`empty-${index}`} style={{ backgroundColor: 'transparent' }} />;
                }

                const isTodayOff = cell.isOff;
                const dayOfWeek = index % 7;
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                // 為了避免在極小高度下爆格，當日班表多於 2 個時，改用雙欄位並排顯示，最多顯示 6 個時段，多於 6 個則顯示 "•••"
                const useTwoColumns = cell.slots.length > 2;
                const maxVisibleSlots = useTwoColumns ? 6 : 2;
                const displayedSlots = cell.slots.slice(0, maxVisibleSlots);
                const hasMoreSlots = cell.slots.length > maxVisibleSlots;

                return (
                  <div 
                    key={`day-${cell.day}`} 
                    style={{
                      border: `0.5px solid ${themeColors.border}`,
                      borderRadius: '4px',
                      padding: scale.cellPadding,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'stretch',
                      backgroundColor: isTodayOff ? 'transparent' : 'rgba(255,255,255,0.4)',
                      opacity: isTodayOff ? 0.8 : 1,
                      boxSizing: 'border-box',
                      overflow: 'hidden'
                    }}
                  >
                    {/* 日期標題 */}
                    <div style={{
                      fontSize: scale.dayFontSize,
                      fontWeight: '700',
                      marginBottom: '1px',
                      paddingLeft: '2px',
                      color: isWeekend ? '#D9534F' : themeColors.textPrimary,
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
                          fontSize: isSquare ? '7px' : '8px',
                          fontWeight: 'bold',
                          gap: '1px',
                          opacity: 0.8,
                          height: '100%'
                        }}>
                          <div 
                            style={{ width: isSquare ? '10px' : '12px', height: isSquare ? '10px' : '12px' }}
                            dangerouslySetInnerHTML={{ __html: theme.decorations.leafIcon }}
                          />
                          <span>休假</span>
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
                                  lineHeight: '1.1',
                                  padding: slotPadding,
                                  borderRadius: '2px',
                                  backgroundColor: themeColors.slotBg,
                                  color: themeColors.slotText,
                                  width: '100%',
                                  textAlign: 'center',
                                  boxSizing: 'border-box',
                                  fontWeight: '600',
                                  border: `1px solid ${themeColors.textPrimary}2e`,
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
                          gap: '1.5px',
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
                                  borderRadius: '2px',
                                  backgroundColor: themeColors.slotBg,
                                  color: themeColors.slotText,
                                  width: '100%',
                                  textAlign: 'center',
                                  boxSizing: 'border-box',
                                  fontWeight: '600',
                                  border: `1px solid ${themeColors.textPrimary}2e`,
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

          {/* ================= C. 水平排版時的底部資訊欄 (對稱設計，Logo 保證置中) ================= */}
          {!isSidebarLayout && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'stretch',
              marginTop: isStory ? '12px' : isPortrait ? '8px' : '6px',
              gap: isStory ? '12px' : '6px',
              height: scale.footerHeight,
              boxSizing: 'border-box',
              width: '100%'
            }}>
              {/* 左側：預約須知卡片 (flex: 1) */}
              <div style={{
                flex: '1 1 0px',
                minWidth: 0,
                border: `1px solid ${themeColors.border}`,
                backgroundColor: themeColors.cardBg,
                padding: isStory ? '8px 12px' : '6px 8px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                overflow: 'hidden'
              }}>
                <h4 style={{ 
                  fontSize: isStory ? '10.5px' : '9.5px', 
                  margin: '0 0 4px 0', 
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  borderBottom: `1px solid ${themeColors.border}`,
                  paddingBottom: '2px'
                }}>
                  ✦ 預約須知 ✦
                </h4>
                <ul style={{ 
                  margin: 0, 
                  padding: '0 4px 0 10px', 
                  fontSize: scale.footerNotesFontSize, 
                  lineHeight: scale.footerNotesLineHeight,
                  opacity: 0.9,
                  listStyleType: 'disc',
                  overflow: 'hidden'
                }}>
                  {notesList.slice(0, isSquare ? 2 : 3).map((item, idx) => (
                    <li key={idx} style={{ 
                      marginBottom: '2px', 
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

              {/* 中間：品牌商標 Logo (固定寬度，完美置中) */}
              <div style={{
                flex: isStory ? '0 0 145px' : isPortrait ? '0 0 120px' : '0 0 100px',
                border: `1px solid ${themeColors.border}`,
                backgroundColor: themeColors.cardBg,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 6px',
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.01)',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: hideBrandText 
                    ? '90%' 
                    : (logoImgUrl ? `calc(${scale.footerLogoIconSize} * 1.5)` : scale.footerLogoIconSize), 
                  height: hideBrandText 
                    ? '80%' 
                    : (logoImgUrl ? `calc(${scale.footerLogoIconSize} * 1.5)` : scale.footerLogoIconSize), 
                  color: themeColors.accent, 
                  marginBottom: hideBrandText ? '0px' : '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {logoImgUrl ? (
                    <img src={logoImgUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M12 2C8 6 4 10 4 15a8 8 0 0 0 16 0c0-5-4-9-8-13Z" />
                    </svg>
                  )}
                </div>
                {!hideBrandText && (
                  <>
                    <h3 style={{ 
                      fontSize: scale.footerLogoFontSize, 
                      fontWeight: 'bold', 
                      margin: '0 0 2px 0', 
                      letterSpacing: '1px',
                      whiteSpace: 'nowrap'
                    }}>
                      {brandName}
                    </h3>
                    <p style={{ 
                      fontSize: scale.footerSloganFontSize, 
                      margin: 0, 
                      opacity: 0.8, 
                      fontStyle: 'italic',
                      whiteSpace: 'nowrap'
                    }}>
                      {slogan}
                    </p>
                  </>
                )}
              </div>

              {/* 右側：QR Code 區塊 (flex: 1，與左側寬度完全一致) */}
              <div style={{
                flex: '1 1 0px',
                minWidth: 0,
                border: `1px solid ${themeColors.border}`,
                backgroundColor: themeColors.cardBg,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isStory ? '6px 12px' : '4px 8px',
                gap: isStory ? '8px' : '4px'
              }}>
                <QRCodeGen url={qrUrl} color={themeColors.textPrimary} size={scale.qrSize} />
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  minWidth: 0,
                  flex: '1 1 0px' // 讓文字區域伸展，佔滿剩餘空間
                }}>
                  <span style={{ 
                    fontSize: scale.qrLabelFontSize, 
                    fontWeight: 'bold', 
                    color: themeColors.textPrimary, 
                    marginBottom: '1px',
                    whiteSpace: 'nowrap'
                  }}>
                    立即預約
                  </span>
                  <p style={{ 
                    fontSize: scale.qrDescFontSize, 
                    margin: 0, 
                    opacity: 0.8, 
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    wordBreak: 'break-all'
                  }}>
                    {qrText.replace(/\n/g, ' ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 底部小字 */}
          {!isSidebarLayout && (
            <div style={{
              textAlign: 'center',
              fontSize: isStory ? '8px' : '7px',
              opacity: 0.4,
              marginTop: '4px',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              — Created via Beauty Appointment Planner —
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
