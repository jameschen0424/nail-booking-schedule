import { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { THEMES } from './utils/themes';
import EditorPanel from './components/EditorPanel';
import PreviewCanvas from './components/PreviewCanvas';
import { Sparkles, Copy, Download, X, HelpCircle, PhoneCall, Info, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import './App.css';

const getLocalStorageValue = (key, defaultValue) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading localStorage key", key, error);
    return defaultValue;
  }
};

export default function App() {
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [year, setYear] = useState(() => getLocalStorageValue('salon_year', new Date().getFullYear()));
  const [month, setMonth] = useState(() => getLocalStorageValue('salon_month', new Date().getMonth() + 1));
  const [theme, setTheme] = useState(() => {
    const savedThemeId = getLocalStorageValue('salon_theme_id', 'sageGreen');
    return THEMES[savedThemeId] || THEMES.sageGreen;
  });
  const [aspectRatio, setAspectRatio] = useState(() => getLocalStorageValue('salon_aspectRatio', 'story'));
  const [fontStyle, setFontStyle] = useState(() => getLocalStorageValue('salon_fontStyle', 'serif'));
  const [title, setTitle] = useState(() => getLocalStorageValue('salon_title', '美甲預約表'));
  const [titleEn, setTitleEn] = useState(() => getLocalStorageValue('salon_titleEn', 'NAIL APPOINTMENT SCHEDULE'));
  const [brandName, setBrandName] = useState(() => {
    const val = getLocalStorageValue('salon_brandName', 'Yunnie Nail');
    return (val === 'Yunnie Salon' || val === 'Yunnie nail') ? 'Yunnie Nail' : val;
  });
  const [slogan, setSlogan] = useState(() => getLocalStorageValue('salon_slogan', '用心成就你的美 ♡'));
  const [staffName, setStaffName] = useState(() => getLocalStorageValue('salon_staffName', 'Yunnie'));
  const [subSlogan, setSubSlogan] = useState(() => getLocalStorageValue('salon_subSlogan', '— 美麗，從指尖開始 —'));
  const [notes, setNotes] = useState(() => getLocalStorageValue('salon_notes', '請提前預約，確保時段為您保留\n如需更改時間，請三天前告知\n遲到超過15分鐘改做單色，超過20分鐘自動取消預約'));
  const [qrUrl, setQrUrl] = useState(() => {
    const val = getLocalStorageValue('salon_qrUrl', 'https://lin.ee/RIkbQrKR');
    return val === 'https://line.me/R/ti/p/@yunnie_nail' ? 'https://lin.ee/RIkbQrKR' : val;
  });
  const [qrText, setQrText] = useState(() => getLocalStorageValue('salon_qrText', '掃描 QR Code\n私訊預約\n更方便！ ♡'));
  const [customBgUrl, setCustomBgUrl] = useState(() => getLocalStorageValue('salon_customBgUrl', ''));
  const [logoImgUrl, setLogoImgUrl] = useState(() => getLocalStorageValue('salon_logoImgUrl', ''));
  const [hideBrandText, setHideBrandText] = useState(() => getLocalStorageValue('salon_hideBrandText', false));


  // 當選擇配色主題時，自動套用其預設樣式
  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // 班表資料狀態 (從 LocalStorage 載入，否則初始為空物件)
  const [scheduleData, setScheduleData] = useState(() => getLocalStorageValue('salon_scheduleData', {}));

  // 縮放與導出控制
  const [scaleFactor, setScaleFactor] = useState(0.8);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedImageSrc, setExportedImageSrc] = useState('');
  
  const previewAreaRef = useRef(null);
  const exportRef = useRef(null);
  const lastWindowSizeRef = useRef({ width: 0, height: 0 });

  // 初始化預設班表資料：所有日期均無時段（預設空檔，由用戶解析或批次套用）
  useEffect(() => {
    const totalDays = new Date(year, month, 0).getDate();
    let needsUpdate = false;
    const updatedData = { ...scheduleData };

    for (let d = 1; d <= totalDays; d++) {
      if (!updatedData[d]) {
        updatedData[d] = { slots: [], isOff: false };
        needsUpdate = true;
      }
    }

    // 如果是一個全新的、沒有任何排班的狀態，給一些預設演示資料
    const hasAnySlots = Object.values(scheduleData).some(day => (day.slots && day.slots.length > 0) || day.isOff);
    if (!hasAnySlots && Object.keys(scheduleData).length === 0) {
      updatedData[1] = { slots: ['18:00後'], isOff: false };
      updatedData[2] = { slots: ['11:00', '14:00', '17:00後'], isOff: false };
      updatedData[9] = { slots: [], isOff: true };
      updatedData[10] = { slots: [], isOff: true };
      updatedData[12] = { slots: ['11:00', '14:00', '17:00後'], isOff: false };
      updatedData[23] = { slots: [], isOff: true };
      needsUpdate = true;
    }

    if (needsUpdate) {
      setScheduleData(updatedData);
    }
  }, [year, month]);

  // 當排班資料改變時自動存入 LocalStorage
  useEffect(() => {
    if (Object.keys(scheduleData).length > 0) {
      try {
        window.localStorage.setItem('salon_scheduleData', JSON.stringify(scheduleData));
      } catch (e) {
        console.error('Failed to save scheduleData:', e);
      }
    }
  }, [scheduleData]);

  // 將設定自動儲存至 LocalStorage
  useEffect(() => {
    try {
      window.localStorage.setItem('salon_year', JSON.stringify(year));
      window.localStorage.setItem('salon_month', JSON.stringify(month));
      window.localStorage.setItem('salon_theme_id', JSON.stringify(theme.id));
      window.localStorage.setItem('salon_aspectRatio', JSON.stringify(aspectRatio));
      window.localStorage.setItem('salon_fontStyle', JSON.stringify(fontStyle));
      window.localStorage.setItem('salon_title', JSON.stringify(title));
      window.localStorage.setItem('salon_titleEn', JSON.stringify(titleEn));
      window.localStorage.setItem('salon_brandName', JSON.stringify(brandName));
      window.localStorage.setItem('salon_slogan', JSON.stringify(slogan));
      window.localStorage.setItem('salon_staffName', JSON.stringify(staffName));
      window.localStorage.setItem('salon_subSlogan', JSON.stringify(subSlogan));
      window.localStorage.setItem('salon_notes', JSON.stringify(notes));
      window.localStorage.setItem('salon_qrUrl', JSON.stringify(qrUrl));
      window.localStorage.setItem('salon_qrText', JSON.stringify(qrText));
      window.localStorage.setItem('salon_hideBrandText', JSON.stringify(hideBrandText));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [
    year, month, theme, aspectRatio, fontStyle, title, titleEn,
    brandName, slogan, staffName, subSlogan, notes, qrUrl, qrText, hideBrandText
  ]);

  // 分開儲存大型 Base64 檔案以防止超過 localStorage 容量上限
  useEffect(() => {
    try {
      if (logoImgUrl) {
        window.localStorage.setItem('salon_logoImgUrl', JSON.stringify(logoImgUrl));
      } else {
        window.localStorage.removeItem('salon_logoImgUrl');
      }
    } catch (e) {
      console.warn('Failed to save logo base64 image:', e);
    }
  }, [logoImgUrl]);

  useEffect(() => {
    try {
      if (customBgUrl) {
        window.localStorage.setItem('salon_customBgUrl', JSON.stringify(customBgUrl));
      } else {
        window.localStorage.removeItem('salon_customBgUrl');
      }
    } catch (e) {
      console.warn('Failed to save custom background base64 image:', e);
    }
  }, [customBgUrl]);



  // 動態計算縮放比例以適應視窗大小
  useEffect(() => {
    if (!previewAreaRef.current) return;

    // 當比例或版型變更時重設視窗大小快取，確保重新計算縮放
    lastWindowSizeRef.current = { width: 0, height: 0 };

    const handleResize = () => {
      const el = previewAreaRef.current;
      if (!el) return;
      
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const isMobile = currentWidth <= 960;
      
      // 判斷是否需要重新計算，避免手機端網址列收合觸發 resize 導致卡頓與重新渲染：
      // 1. 如果是手機版，只有當寬度改變時才重新計算（忽略高度變化）
      // 2. 如果是桌機版，寬度或高度任一改變時重新計算
      if (isMobile) {
        if (lastWindowSizeRef.current.width === currentWidth) {
          return;
        }
      } else {
        if (
          lastWindowSizeRef.current.width === currentWidth &&
          lastWindowSizeRef.current.height === currentHeight
        ) {
          return;
        }
      }
      
      lastWindowSizeRef.current = { width: currentWidth, height: currentHeight };
      
      const parentWidth = isMobile ? (currentWidth - 32) : (el.clientWidth - 40); // 左右 padding
      const parentHeight = el.clientHeight - 120; // 上下 標示與邊界
      
      const DIMENSIONS = {
        'story': { width: 540, height: 960 },
        'post-portrait': { width: 540, height: 675 },
        'post-square': { width: 540, height: 540 }
      };
      const size = DIMENSIONS[aspectRatio] || DIMENSIONS.story;
      
      const scaleX = parentWidth / size.width;
      const scaleY = parentHeight / size.height;
      
      // 手機版高度為自適應滾動，僅依據寬度縮放以防止無限迴圈導致網頁卡死
      let factor = isMobile ? scaleX : Math.min(scaleX, scaleY);
      if (factor > 1.1) factor = 1.1; // 上限
      if (factor < 0.15) factor = 0.15; // 下限
      
      setScaleFactor((prev) => {
        // 若變化小於 0.005 (0.5%) 則不更新狀態，避免微小的亞像素變化或滾動微調引發頻繁重繪與閃爍
        if (Math.abs(prev - factor) < 0.005) return prev;
        return factor;
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 立即計算一次
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [aspectRatio]);

  // 導出為 PNG
  const handleExport = async () => {
    if (!exportRef.current) return;
    setExportLoading(true);

    try {
      // 延遲 200 毫秒，確保 canvas 中的所有 QR Code / SVG 載入完成
      await new Promise((resolve) => setTimeout(resolve, 200));

      const DIMENSIONS = {
        'story': { width: '540px', height: '960px' },
        'post-portrait': { width: '540px', height: '675px' },
        'post-square': { width: '540px', height: '540px' }
      };
      const size = DIMENSIONS[aspectRatio] || DIMENSIONS.story;

      // 導出 2.5 倍解析度 確保極致清晰度
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: size.width,
          height: size.height
        }
      });

      setExportedImageSrc(dataUrl);
      setShowExportModal(true);
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('導出預約表失敗，請重試！原因：' + error.message);
    } finally {
      setExportLoading(false);
    }
  };

  // 下載檔案
  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `${year}年${month}月預約空檔表_${staffName}.png`;
    link.href = exportedImageSrc;
    link.click();
  };

  // 複製到剪貼簿 (現代瀏覽器支援)
  const copyImageToClipboard = async () => {
    try {
      const response = await fetch(exportedImageSrc);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      alert('預約表已複製到剪貼簿！可直接貼上 (Ctrl+V) 至 Line/IG 等通訊軟體。');
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      alert('您的瀏覽器不支援直接複製圖片，請使用下載或在圖片上長按儲存！');
    }
  };

  return (
    <div className="app-container">
      {/* 動態背景裝飾 */}
      <div className="app-bg-glow">
        <div className="glow-bubble-1" />
        <div className="glow-bubble-2" />
        <div className="glow-bubble-3" />
      </div>

      {/* 1. 左側控制台 */}
      <aside className="sidebar-editor">
        <div className="app-header">
          <div className="app-logo-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h1>美業預約表產生器</h1>
            <p>Aesthetic Schedule Designer</p>
          </div>
        </div>

        <EditorPanel 
          year={year} setYear={setYear}
          month={month} setMonth={setMonth}
          theme={theme} setTheme={handleSetTheme}
          aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
          fontStyle={fontStyle} setFontStyle={setFontStyle}
          title={title} setTitle={setTitle}
          titleEn={titleEn} setTitleEn={setTitleEn}
          brandName={brandName} setBrandName={setBrandName}
          slogan={slogan} setSlogan={setSlogan}
          staffName={staffName} setStaffName={setStaffName}
          subSlogan={subSlogan} setSubSlogan={setSubSlogan}
          notes={notes} setNotes={setNotes}
          qrUrl={qrUrl} setQrUrl={setQrUrl}
          qrText={qrText} setQrText={setQrText}
          scheduleData={scheduleData} setScheduleData={setScheduleData}
          customBgUrl={customBgUrl} setCustomBgUrl={setCustomBgUrl}
          logoImgUrl={logoImgUrl} setLogoImgUrl={setLogoImgUrl}
          hideBrandText={hideBrandText} setHideBrandText={setHideBrandText}
          onExportPng={handleExport}
        />
      </aside>

      {/* 手機版半透明背景遮罩 */}
      <div 
        className={`preview-backdrop ${showMobilePreview ? 'is-open' : ''}`}
        onClick={() => setShowMobilePreview(false)}
      />

      {/* 2. 右側預覽畫布區 */}
      <main className={`preview-area ${showMobilePreview ? 'is-open' : ''}`} ref={previewAreaRef}>
        {/* 手機版抽屜頂部把手與關閉按鈕 */}
        <div className="mobile-preview-header">
          <div className="drawer-handle" />
          <button 
            className="mobile-preview-close-btn"
            onClick={() => setShowMobilePreview(false)}
          >
            <ChevronDown size={18} />
            <span>收起預覽表</span>
          </button>
        </div>

        <div className="preview-header-indicator">
          <span className="pulse-dot" />
          <span>
            {aspectRatio === 'story' 
              ? 'IG 限時動態即時預覽 (1080 x 1920)' 
              : aspectRatio === 'post-portrait' 
              ? 'IG 直式貼文即時預覽 (1080 x 1350)' 
              : 'IG 方形貼文即時預覽 (1080 x 1080)'}
          </span>
        </div>

        {/* 縮放 wrapper 確保在小螢幕能看到全貌，並加上左右負邊距補償，避免 layout width 溢出導致手機版左右滑動異常 */}
        <div 
          className="preview-scaler-container"
          style={{
            transform: `scale(${scaleFactor})`,
            width: `540px`,
            height: `${aspectRatio === 'story' ? 960 : aspectRatio === 'post-portrait' ? 675 : 540}px`,
            marginTop: `${(scaleFactor - 1) * (aspectRatio === 'story' ? 480 : aspectRatio === 'post-portrait' ? 337.5 : 270)}px`,
            marginBottom: `${(scaleFactor - 1) * (aspectRatio === 'story' ? 480 : aspectRatio === 'post-portrait' ? 337.5 : 270)}px`,
            marginLeft: `${(scaleFactor - 1) * 270}px`,
            marginRight: `${(scaleFactor - 1) * 270}px`
          }}
        >
          <PreviewCanvas 
            year={year}
            month={month}
            theme={theme}
            aspectRatio={aspectRatio}
            fontStyle={fontStyle}
            title={title}
            titleEn={titleEn}
            brandName={brandName}
            slogan={slogan}
            staffName={staffName}
            subSlogan={subSlogan}
            notes={notes}
            qrUrl={qrUrl}
            qrText={qrText}
            scheduleData={scheduleData}
            customBgUrl={customBgUrl}
            logoImgUrl={logoImgUrl}
            hideBrandText={hideBrandText}
            exportRef={exportRef}
          />
        </div>

        {/* 移動端匯出指示 */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '8px', alignItems: 'center', opacity: 0.6, fontSize: '11px' }}>
          <Info size={14} />
          <span>手機端若畫面有溢出，可上下滑動檢視，產出圖片將完美切齊。</span>
        </div>
      </main>

      {/* 手機版浮動展開預覽按鈕 */}
      <button 
        className="mobile-preview-toggle-btn"
        onClick={() => setShowMobilePreview(true)}
      >
        <Eye size={16} />
        <span>查看即時預覽</span>
        <ChevronUp size={16} />
      </button>

      {/* 3. 匯出高畫質成果 Modal 視窗 */}
      {showExportModal && (
        <div className="export-modal-overlay">
          <div className="export-modal">
            <div className="export-modal-header">
              <h3>✨ 預約表生成成功！</h3>
              <p>適合直接分享至 IG Story、Line 群組</p>
            </div>
            
            <img 
              src={exportedImageSrc} 
              alt="產出的預約表" 
              className="exported-image-preview" 
            />

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              <PhoneCall size={12} style={{ color: 'var(--primary)' }} />
              <span>手機用戶：可<strong>長按圖片</strong>直接儲存至相簿</span>
            </div>

            <div className="export-actions-row">
              <button className="btn btn-secondary flex-1" onClick={copyImageToClipboard}>
                <Copy size={16} />
                複製圖片
              </button>
              <button className="btn btn-primary flex-1" onClick={downloadImage}>
                <Download size={16} />
                下載 PNG
              </button>
            </div>

            <button 
              className="btn btn-secondary w-full" 
              style={{ marginTop: '12px', background: 'transparent', border: 'none' }}
              onClick={() => setShowExportModal(false)}
            >
              <X size={16} style={{ marginRight: '6px' }} />
              返回修改
            </button>
          </div>
        </div>
      )}

      {/* 當 html-to-image 載入或生成中的 Loading 畫面 */}
      {exportLoading && (
        <div className="export-modal-overlay" style={{ background: 'rgba(247, 243, 236, 0.9)', zIndex: 1000 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="app-logo-icon animate-spin" style={{ margin: '0 auto 16px auto', width: '50px', height: '50px' }}>
              <Sparkles size={28} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>正在生成高畫質預約表...</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>請稍候，這需要幾秒鐘以渲染所有視覺細節</p>
          </div>
        </div>
      )}
    </div>
  );
}
