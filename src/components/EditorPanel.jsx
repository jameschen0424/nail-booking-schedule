import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { THEMES } from '../utils/themes';
import { parseScheduleText } from '../utils/scheduleParser';
import { 
  Sparkles, 
  Upload, 
  Calendar, 
  Settings, 
  Layers, 
  FileText, 
  Link, 
  Clock, 
  Plus, 
  Trash2, 
  ChevronDown, 
  Check, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

export default function EditorPanel({
  year, setYear,
  month, setMonth,
  theme, setTheme,
  aspectRatio, setAspectRatio,
  fontStyle, setFontStyle,
  title, setTitle,
  titleEn, setTitleEn,
  brandName, setBrandName,
  slogan, setSlogan,
  staffName, setStaffName,
  subSlogan, setSubSlogan,
  notes, setNotes,
  qrUrl, setQrUrl,
  qrText, setQrText,
  scheduleData, setScheduleData,
  customBgUrl, setCustomBgUrl,
  logoImgUrl, setLogoImgUrl,
  heroImgUrl, setHeroImgUrl,
  hideBrandText, setHideBrandText,
  onExportPng
}) {
  const [inputText, setInputText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [activeTab, setActiveTab] = useState('text-import'); // 'text-import', 'basic-info', 'style', 'slots-edit'
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const heroInputRef = useRef(null);
  const customBgInputRef = useRef(null);

  // 批次設定時段用狀態
  const [batchDays, setBatchDays] = useState({
    1: true, 2: true, 3: true, 4: true, 5: true, 0: false, 6: false // 1-5代表週一到週五，0,6代表週日、週六
  });
  const [batchSlots, setBatchSlots] = useState(['11:00', '14:00', '17:00後']);
  const [newBatchSlot, setNewBatchSlot] = useState('');

  // 細部設定單日狀態
  const [selectedDay, setSelectedDay] = useState(1);
  const [newDaySlot, setNewDaySlot] = useState('');

  // OCR 辨識函數
  const handleOcrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrProgress(0);
    setOcrStatus('初始化辨識引擎...');

    try {
      // 創建 Tesseract.js Worker，並加載繁體中文與英文
      const worker = await createWorker('chi_tra+eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrStatus('AI 正在識別圖片中...');
            setOcrProgress(Math.round(m.progress * 100));
          } else {
            setOcrStatus(m.status === 'loading tesseract api' ? '載入辨識庫...' : '解析中...');
          }
        }
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setInputText(prev => prev ? prev + '\n' + text : text);
      setOcrStatus('辨識成功！請點選下方「自動解析排程」套用');
    } catch (error) {
      console.error('OCR Error:', error);
      setOcrStatus('辨識失敗，請改用文字輸入或更換清晰的圖片');
    } finally {
      setOcrLoading(false);
      // 清除 file input 值，允許重選
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 點選解析文字
  const handleParseText = () => {
    if (!inputText.trim()) {
      alert('請先輸入或上傳文字班表！');
      return;
    }
    const parseResult = parseScheduleText(inputText, year, month);
    setYear(parseResult.year);
    setMonth(parseResult.month);
    
    // 更新班表資料 (保留未解析到的日期的預設)
    const newSchedule = { ...scheduleData };
    
    // 預設將該月所有日期先清空，再填入解析結果
    const totalDays = new Date(parseResult.year, parseResult.month, 0).getDate();
    for (let d = 1; d <= totalDays; d++) {
      newSchedule[d] = { slots: [], isOff: false };
    }

    Object.keys(parseResult.days).forEach(day => {
      newSchedule[day] = parseResult.days[day];
    });

    setScheduleData(newSchedule);
    alert(`解析成功！已更新 ${parseResult.month} 月份班表`);
  };

  // 自訂背景上傳
  const handleCustomBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomBgUrl(event.target.value || event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 品牌 Logo 上傳
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoImgUrl(event.target.value || event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 作品展示照片上傳
  const handleHeroUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setHeroImgUrl(event.target.value || event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 批次套用時段
  const handleApplyBatch = () => {
    const newSchedule = { ...scheduleData };
    const totalDays = new Date(year, month, 0).getDate();

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon...
      
      // 如果該星期被選中，套用設定
      if (batchDays[dayOfWeek]) {
        newSchedule[d] = {
          slots: [...batchSlots],
          isOff: false
        };
      }
    }
    setScheduleData(newSchedule);
    alert('已成功批次套用時段！');
  };

  // 快速切換當日休假/營業
  const toggleDayOff = (day) => {
    const current = scheduleData[day] || { slots: [], isOff: false };
    setScheduleData({
      ...scheduleData,
      [day]: {
        ...current,
        isOff: !current.isOff,
        slots: current.isOff ? ['11:00', '14:00', '17:00後'] : [] // 取消休假時給予預設
      }
    });
  };

  // 新增當日時段
  const addDaySlot = (day) => {
    if (!newDaySlot.trim()) return;
    const current = scheduleData[day] || { slots: [], isOff: false };
    
    // 避免重複
    if (current.slots.includes(newDaySlot.trim())) {
      setNewDaySlot('');
      return;
    }

    const updatedSlots = [...current.slots, newDaySlot.trim()].sort();
    setScheduleData({
      ...scheduleData,
      [day]: {
        ...current,
        isOff: false,
        slots: updatedSlots
      }
    });
    setNewDaySlot('');
  };

  // 刪除當日時段
  const removeDaySlot = (day, slotIndex) => {
    const current = scheduleData[day] || { slots: [], isOff: false };
    const updatedSlots = current.slots.filter((_, idx) => idx !== slotIndex);
    setScheduleData({
      ...scheduleData,
      [day]: {
        ...current,
        slots: updatedSlots
      }
    });
  };

  // 新增批次設定時段
  const addBatchSlot = () => {
    if (newBatchSlot && !batchSlots.includes(newBatchSlot)) {
      setBatchSlots([...batchSlots, newBatchSlot].sort());
    }
    setNewBatchSlot('');
  };

  // 移除批次設定時段
  const removeBatchSlot = (slot) => {
    setBatchSlots(batchSlots.filter(s => s !== slot));
  };

  // 套用時段範本
  const applyPresetSlots = (type) => {
    if (type === 'three') {
      setBatchSlots(['10:00', '14:00', '19:00']);
    } else if (type === 'two') {
      setBatchSlots(['13:00', '18:00']);
    } else if (type === 'hourly') {
      setBatchSlots(['11:00', '13:00', '15:00', '17:00', '19:00']);
    } else if (type === 'clear') {
      setBatchSlots([]);
    }
  };

  // 全月月曆清除與標記休假工具
  const handleCalendarAction = (action) => {
    const totalDays = new Date(year, month, 0).getDate();
    const newSchedule = { ...scheduleData };
    
    if (action === 'clear_slots') {
      if (window.confirm('確定要清空整個月的所有預約時段嗎？(休假標記會保留)')) {
        for (let d = 1; d <= totalDays; d++) {
          newSchedule[d] = {
            ...newSchedule[d],
            slots: []
          };
        }
        setScheduleData(newSchedule);
      }
    } else if (action === 'mark_all_off') {
      if (window.confirm('確定要把整個月的所有日期都標記為「休假」嗎？')) {
        for (let d = 1; d <= totalDays; d++) {
          newSchedule[d] = {
            slots: [],
            isOff: true
          };
        }
        setScheduleData(newSchedule);
      }
    } else if (action === 'clear_all_off') {
      if (window.confirm('確定要取消整個月的所有「休假」標記嗎？')) {
        for (let d = 1; d <= totalDays; d++) {
          newSchedule[d] = {
            ...newSchedule[d],
            isOff: false
          };
        }
        setScheduleData(newSchedule);
      }
    }
  };

  return (
    <div className="editor-panel">
      {/* 頁籤選單 */}
      <div className="tab-menu">
        <button 
          className={`tab-btn ${activeTab === 'text-import' ? 'active' : ''}`}
          onClick={() => setActiveTab('text-import')}
        >
          <Sparkles size={16} />
          <span>AI 辨識</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'basic-info' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic-info')}
        >
          <FileText size={16} />
          <span>基本內容</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          <Layers size={16} />
          <span>版型配色</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'slots-edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('slots-edit')}
        >
          <Clock size={16} />
          <span>時段微調</span>
        </button>
      </div>

      <div className="tab-content">
        
        {/* ================= 頁籤 1: AI 辨識與文字匯入 ================= */}
        {activeTab === 'text-import' && (
          <div className="panel-section">
            <div className="section-header-group">
              <div className="section-title">
                <Sparkles className="icon-gold" size={18} />
                <h3>AI 班表快速解析</h3>
              </div>
              <p className="section-desc">
                你可以上傳帶有班表的「圖片」或直接貼上「文字行程」，系統將自動辨識月份與空檔時間！
              </p>
            </div>

            {/* 圖片 OCR 上傳區 */}
            <div 
              className="ocr-upload-zone"
              onClick={() => fileInputRef.current?.click()}
            >
              {ocrLoading ? (
                <div className="ocr-loading-state">
                  <Loader2 className="animate-spin" size={32} />
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${ocrProgress}%` }} />
                  </div>
                  <span className="ocr-progress-num">{ocrProgress}%</span>
                  <span className="ocr-status-text">{ocrStatus}</span>
                </div>
              ) : (
                <div className="ocr-placeholder">
                  <Upload size={28} />
                  <span className="primary-text">上傳班表截圖 / 圖片</span>
                  <span className="sub-text">支援手寫或打字班表 (JPG, PNG)</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleOcrUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>

            {/* 文字貼入口 */}
            <div className="form-group">
              <label>行程文字內容 (或辨識後的文字)</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="例如：
5/1: 18:00後
5/2: 11:00, 14:00, 17:00後
5/3: 休假
16號: 11:00, 14:00"
                rows={8}
              />
            </div>

            <button 
              className="btn btn-primary w-full"
              onClick={handleParseText}
              disabled={ocrLoading}
            >
              自動解析排程并套用
            </button>
          </div>
        )}

        {/* ================= 頁籤 2: 基本內容設定 ================= */}
        {activeTab === 'basic-info' && (
          <div className="panel-section">
            <div className="section-title">
              <FileText size={18} />
              <h3>預約表文字內容</h3>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>年份</label>
                <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                  {[2025, 2026, 2027, 2028].map(y => (
                    <option key={y} value={y}>{y} 年</option>
                  ))}
                </select>
              </div>
              <div className="form-group flex-1">
                <label>月份</label>
                <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m} 月</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>主標題 (例如：預約空檔表)</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="例如：可預約時段、美睫預約表"
              />
            </div>

            <div className="form-group">
              <label>英文副標題 (Subtitle)</label>
              <input 
                type="text" 
                value={titleEn} 
                onChange={(e) => setTitleEn(e.target.value)} 
                placeholder="例如：Appointment Schedule"
              />
            </div>

            <div className="form-group">
              <label>設計師 / 服務人員名稱</label>
              <input 
                type="text" 
                value={staffName} 
                onChange={(e) => setStaffName(e.target.value)} 
                placeholder="例如：Yunnie"
              />
            </div>

            <div className="form-group">
              <label>品牌 / 店名名稱 (或 Logo 文字)</label>
              <input 
                type="text" 
                value={brandName} 
                onChange={(e) => setBrandName(e.target.value)} 
                placeholder="例如：Yunnie nail"
              />
            </div>

            <div className="form-group">
              <label>品牌 Logo 圖片 (可選)</label>
              {logoImgUrl ? (
                <div className="custom-bg-preview-wrap" style={{ padding: '6px', gap: '12px' }}>
                  <div 
                    className="custom-bg-preview-thumbnail" 
                    style={{ 
                      backgroundImage: `url(${logoImgUrl})`, 
                      borderRadius: '4px', 
                      width: '40px', 
                      height: '40px',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }}
                  />
                  <button 
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setLogoImgUrl('')}
                  >
                    移除 Logo
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  className="btn btn-secondary btn-sm w-full"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload size={14} style={{ marginRight: '6px' }} />
                  上傳品牌 Logo 圖片
                </button>
              )}
              <input 
                type="file" 
                ref={logoInputRef} 
                onChange={handleLogoUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>

            {/* 作品展示照片 */}
            <div className="form-group">
              <label>作品展示照片 (Header Photo)</label>
              {heroImgUrl ? (
                <div className="logo-preview-wrap">
                  <div 
                    className="logo-preview-thumbnail" 
                    style={{ 
                      backgroundImage: `url(${heroImgUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }}
                  />
                  <button 
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setHeroImgUrl('')}
                  >
                    移除照片
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  className="btn btn-secondary btn-sm w-full"
                  onClick={() => heroInputRef.current?.click()}
                >
                  <Upload size={14} style={{ marginRight: '6px' }} />
                  上傳作品展示照片
                </button>
              )}
              <input 
                type="file" 
                ref={heroInputRef} 
                onChange={handleHeroUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
              <input 
                type="checkbox" 
                id="hideBrandTextCheckbox"
                checked={hideBrandText}
                onChange={(e) => setHideBrandText(e.target.checked)}
                style={{ width: '16px', height: '16px', margin: 0, cursor: 'pointer' }}
              />
              <label htmlFor="hideBrandTextCheckbox" style={{ cursor: 'pointer', userSelect: 'none', fontSize: '12.5px', color: 'var(--text-light)' }}>
                隱藏品牌文字與標語 (適用於 Logo 已含店名時)
              </label>
            </div>

            <div className="form-group">
              <label>副標語 (Slogan)</label>
              <input 
                type="text" 
                value={slogan} 
                onChange={(e) => setSlogan(e.target.value)} 
                placeholder="例如：用心成就你的美 ♡"
                disabled={hideBrandText}
                style={{ opacity: hideBrandText ? 0.5 : 1 }}
              />
            </div>

            <div className="form-group">
              <label>主標題旁英文或短標語</label>
              <input 
                type="text" 
                value={subSlogan} 
                onChange={(e) => setSubSlogan(e.target.value)} 
                placeholder="例如：— 美麗，從指尖開始 —"
              />
            </div>

            <div className="form-group">
              <label>預約須知說明 (換行可自動分成多點)</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                rows={4}
                placeholder="請輸入注意事項..."
              />
            </div>

            <div className="form-group">
              <label>預約 QR Code 連結 (LINE 或 IG 預約網址)</label>
              <input 
                type="text" 
                value={qrUrl} 
                onChange={(e) => setQrUrl(e.target.value)} 
                placeholder="https://line.me/R/ti/p/..."
              />
            </div>

            <div className="form-group">
              <label>QR Code 下方小文字</label>
              <input 
                type="text" 
                value={qrText} 
                onChange={(e) => setQrText(e.target.value)} 
                placeholder="掃描 QR Code 私訊預約！"
              />
            </div>
          </div>
        )}

        {/* ================= 頁籤 3: 版型與風格 ================= */}
        {activeTab === 'style' && (
          <div className="panel-section">
            {/* A. 圖片尺寸規格 */}
            <div className="form-group">
              <label>圖片比例規格 (Aspect Ratio)</label>
              <div className="form-row">
                <button 
                  type="button"
                  className={`btn flex-1 btn-sm ${aspectRatio === 'story' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setAspectRatio('story')}
                >
                  限動 (9:16)
                </button>
                <button 
                  type="button"
                  className={`btn flex-1 btn-sm ${aspectRatio === 'post-portrait' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setAspectRatio('post-portrait')}
                >
                  直式貼文 (4:5)
                </button>
                <button 
                  type="button"
                  className={`btn flex-1 btn-sm ${aspectRatio === 'post-square' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setAspectRatio('post-square')}
                >
                  方形貼文 (1:1)
                </button>
              </div>
            </div>



            {/* C. 風格字體選擇 */}
            <div className="form-group">
              <label>風格字型搭配 (Typography)</label>
              <select value={fontStyle} onChange={(e) => setFontStyle(e.target.value)}>
                <option value="serif">典雅襯線體 (Serif - 溫雅奢華)</option>
                <option value="sans">時尚黑體 (Sans-serif - 簡潔摩登)</option>
                <option value="cursive">浪漫手寫體 (Cursive - 手寫優雅)</option>
                <option value="minimal">極簡無襯線 (Minimalist - 北歐簡約)</option>
              </select>
            </div>



            <div className="divider" />

            {/* D. 配色與裝飾主題 */}
            <div className="form-group">
              <label>配色與裝飾主題 (Theme Color)</label>
              <div className="theme-grid">
                {Object.values(THEMES).map((t) => {
                  const isSelected = theme.id === t.id;
                  return (
                    <div 
                       key={t.id}
                       className={`theme-card ${isSelected ? 'selected' : ''}`}
                       onClick={() => setTheme(t)}
                    >
                      <div className="theme-color-dots">
                        <span style={{ backgroundColor: t.colors.background }} />
                        <span style={{ backgroundColor: t.colors.headerBg }} />
                        <span style={{ backgroundColor: t.colors.accent }} />
                      </div>
                      <span className="theme-name">{t.name}</span>
                      {isSelected && <Check className="selected-icon" size={14} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="divider" />

            {/* E. 自訂背景 */}
            <div className="section-header-group">
              <div className="section-title">
                <ImageIcon size={18} />
                <h3>自訂底圖背景</h3>
              </div>
              <p className="section-desc">
                如果不使用預設主題的背景，你可以上傳自己設計的底圖 (例如從 Canva 製作的 9:16、4:5 底圖)
              </p>
            </div>

            <div className="custom-bg-section">
              {customBgUrl ? (
                <div className="custom-bg-preview-wrap">
                  <div 
                    className="custom-bg-preview-thumbnail" 
                    style={{ backgroundImage: `url(${customBgUrl})` }}
                  />
                  <button 
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setCustomBgUrl('')}
                  >
                    移除自訂底圖
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => customBgInputRef.current?.click()}
                >
                  <Upload size={16} style={{ marginRight: '8px' }} />
                  上傳自訂背景圖
                </button>
              )}
              <input 
                type="file" 
                ref={customBgInputRef} 
                onChange={handleCustomBgUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>
          </div>
        )}

        {/* ================= 頁籤 4: 時段細部微調 ================= */}
        {activeTab === 'slots-edit' && (
          <div className="panel-section">
            
            {/* 1. 批次快速設定 */}
            <div className="sub-section">
            <div className="section-header-group">
              <div className="section-title">
                <Clock size={16} />
                <h4>批次快速填寫</h4>
              </div>
              <p className="section-desc">
                選擇星期與預設空檔時段，快速一次性填滿整個月份！
              </p>
            </div>

              {/* 星期多選 */}
              <label className="sub-label">套用星期</label>
              <div className="weekday-selector">
                {['日', '一', '二', '三', '四', '五', '六'].map((w, idx) => (
                  <button
                    key={idx}
                    className={`weekday-btn ${batchDays[idx] ? 'active' : ''}`}
                    onClick={() => setBatchDays({ ...batchDays, [idx]: !batchDays[idx] })}
                  >
                    {w}
                  </button>
                ))}
              </div>

              {/* 批次時段編輯 */}
              <label className="sub-label">時段列表</label>
              <div className="batch-slots-list">
                {batchSlots.map((slot) => (
                  <span key={slot} className="batch-slot-badge">
                    {slot}
                    <button onClick={() => removeBatchSlot(slot)}>×</button>
                  </span>
                ))}
              </div>

              {/* 熱門預設範本 */}
              <div className="preset-btn-group" style={{ marginBottom: '4px' }}>
                <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => applyPresetSlots('three')}>三段班</button>
                <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => applyPresetSlots('two')}>兩段班</button>
                <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => applyPresetSlots('hourly')}>整點班</button>
                <button type="button" className="btn btn-danger btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => applyPresetSlots('clear')}>清空時段</button>
              </div>

              {/* 新增批次時段 */}
              <div className="add-slot-row">
                <input 
                  type="text" 
                  value={newBatchSlot} 
                  onChange={(e) => setNewBatchSlot(e.target.value)} 
                  placeholder="例如: 11:00, 18:30後"
                />
                <button className="btn btn-secondary btn-sm" onClick={addBatchSlot}>
                  新增
                </button>
              </div>

              <button className="btn btn-secondary w-full" style={{ marginTop: '10px' }} onClick={handleApplyBatch}>
                批次套用至本月
              </button>
            </div>

            <div className="divider" />

            {/* 2. 單日細部微調 */}
            <div className="sub-section">
            <div className="section-header-group">
              <div className="section-title">
                <Calendar size={16} />
                <h4>單日細緻微調</h4>
              </div>
              <p className="section-desc">
                選擇具體日期，點擊「休假」或個別修改、刪除當日預約時段。
              </p>
            </div>

              <div className="form-group">
                <label>選擇修改日期</label>
                <select 
                  value={selectedDay} 
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                >
                  {Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d} 號 (週{['日','一','二','三','四','五','六'][new Date(year, month-1, d).getDay()]})</option>
                  ))}
                </select>
              </div>

              <div className="day-control-card">
                <div className="day-control-header">
                  <span className="day-number-label">{selectedDay} 號</span>
                  <button 
                    className={`btn btn-sm ${scheduleData[selectedDay]?.isOff ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => toggleDayOff(selectedDay)}
                  >
                    {scheduleData[selectedDay]?.isOff ? '休假中' : '標記休假'}
                  </button>
                </div>

                {!scheduleData[selectedDay]?.isOff && (
                  <div className="day-slots-manager">
                    <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '6px' }}>
                      當日時段：
                    </label>
                    <div className="day-slots-list">
                      {(!scheduleData[selectedDay]?.slots || scheduleData[selectedDay]?.slots.length === 0) ? (
                        <span className="no-slots-hint">無空檔時段</span>
                      ) : (
                        scheduleData[selectedDay].slots.map((s, idx) => (
                          <span key={s} className="slot-badge">
                            {s}
                            <button onClick={() => removeDaySlot(selectedDay, idx)}>×</button>
                          </span>
                        ))
                      )}
                    </div>

                    <div className="add-slot-row" style={{ marginTop: '8px' }}>
                      <input 
                        type="text" 
                        value={newDaySlot} 
                        onChange={(e) => setNewDaySlot(e.target.value)} 
                        placeholder="新增時段, 如 13:00"
                        onKeyDown={(e) => e.key === 'Enter' && addDaySlot(selectedDay)}
                      />
                      <button className="btn btn-secondary btn-sm" onClick={() => addDaySlot(selectedDay)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="divider" />

            {/* 3. 全月快速重設工具 */}
            <div className="sub-section">
              <div className="section-title">
                <Trash2 size={16} className="icon-gold" />
                <h4>全月重置工具</h4>
              </div>
              <p className="section-desc">
                一次性重置或清除整個月份的排程與休假設定。
              </p>
              <div className="reset-btn-group">
                <button type="button" className="btn btn-secondary flex-1 btn-sm" style={{ padding: '6px 4px', fontSize: '11.5px' }} onClick={() => handleCalendarAction('clear_slots')}>
                  清空全月時段
                </button>
                <button type="button" className="btn btn-secondary flex-1 btn-sm" style={{ padding: '6px 4px', fontSize: '11.5px' }} onClick={() => handleCalendarAction('mark_all_off')}>
                  全月標記休假
                </button>
                <button type="button" className="btn btn-secondary flex-1 btn-sm" style={{ padding: '6px 4px', fontSize: '11.5px' }} onClick={() => handleCalendarAction('clear_all_off')}>
                  全月取消休假
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 底部導出按鈕 */}
      <div className="editor-footer">
        <button 
          className="btn btn-primary w-full btn-lg"
          onClick={onExportPng}
        >
          <Sparkles size={18} style={{ marginRight: '8px' }} />
          產出高畫質預約表圖片 (PNG)
        </button>
      </div>
    </div>
  );
}
