/**
 * 定義 4 套精美版型的主題與樣式設定
 * 為了避免導出圖片時的跨域(CORS)問題，所有背景紋理與裝飾圖案均以 SVG 向量路徑或純 CSS 繪製。
 */
export const THEMES = {
  sageGreen: {
    id: 'sageGreen',
    name: '翡翠綠大理石 (Sage Green)',
    fontFamily: '"Noto Serif TC", "Playfair Display", Georgia, serif',
    layout: 'sidebar', // 'sidebar' 代表左側直欄排版，'footer' 代表底部排版
    colors: {
      background: '#F5F7F6',
      textPrimary: '#2D4846', // 深翡翠綠
      textSecondary: '#5F7D7B', // 鼠尾草綠
      border: '#E3EBEA',
      slotBg: '#D8EBE9',
      slotText: '#1C3B3A',
      headerBg: '#5F7D7B',
      headerText: '#FFFFFF',
      accent: '#D4AF37', // 香檳金
      cardBg: 'rgba(255, 255, 255, 0.92)'
    },
    // 裝飾用 SVG 元素的 React 渲染參數
    decorations: {
      topLeft: `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-20 -20 C 50 10, 80 80, 50 150 C 40 120, 20 90, -20 -20 Z" fill="#E4ECEB" opacity="0.6"/>
          <path d="M-10 10 C 30 40, 50 80, 20 120 C 10 90, 5 70, -10 10 Z" fill="#D5DFDE" opacity="0.5"/>
          <path d="M10 -10 Q 80 40, 120 120" stroke="#E1CCAC" stroke-width="1.5" stroke-dasharray="1 3"/>
        </svg>
      `,
      bottomRight: `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M220 220 C 150 190, 120 120, 150 50 C 160 80, 180 110, 220 220 Z" fill="#E4ECEB" opacity="0.6"/>
          <path d="M210 190 C 170 160, 150 120, 180 80 C 190 110, 195 130, 210 190 Z" fill="#D5DFDE" opacity="0.5"/>
          <path d="M190 210 Q 120 160, 80 80" stroke="#E1CCAC" stroke-width="1.5" stroke-dasharray="1 3"/>
        </svg>
      `,
      leafIcon: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z"/>
          <path d="M9 22v-4h4"/>
        </svg>
      `
    }
  },
  beigeLuxury: {
    id: 'beigeLuxury',
    name: '法式奶茶金 (Beige Luxury)',
    fontFamily: '"Noto Serif TC", "Playfair Display", Georgia, serif',
    layout: 'footer',
    colors: {
      background: '#F9F6F0',
      textPrimary: '#6C533F', // 奶茶深褐
      textSecondary: '#8E7560',
      border: '#F3ECE5',
      slotBg: '#F3E5D8',
      slotText: '#5A4335',
      headerBg: '#BCA38A', // 金棕色
      headerText: '#FFFFFF',
      accent: '#D4AF37', // 金
      cardBg: 'rgba(255, 255, 255, 0.94)'
    },
    decorations: {
      topLeft: `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="100" fill="#FAF6F0" stroke="#F1E8DF" stroke-width="1"/>
          <path d="M0,0 Q 80,40 100,120 Q 50,140 0,0" fill="#EADED2" opacity="0.4"/>
          <path d="M20,0 Q 100,20 120,90" stroke="#D3B89B" stroke-width="1"/>
        </svg>
      `,
      bottomRight: `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M200,200 Q 120,160 100,80 Q 150,60 200,200" fill="#EADED2" opacity="0.4"/>
          <path d="M180,200 Q 100,180 80,110" stroke="#D3B89B" stroke-width="1"/>
        </svg>
      `,
      leafIcon: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M2 22C2 22 6 18 12 18C18 18 22 22 22 22" />
          <path d="M12 2v16" />
          <path d="M12 6C8 7 4 10 4 13C4 16 7 18 12 18C17 18 20 16 20 13C20 10 16 7 12 6Z" fill="#F4EAE1" opacity="0.5"/>
        </svg>
      `
    }
  },
  turquoiseGold: {
    id: 'turquoiseGold',
    name: '海洋大理石 (Turquoise Gold)',
    fontFamily: '"Noto Sans TC", sans-serif',
    layout: 'footer',
    colors: {
      background: '#EDF5F4',
      textPrimary: '#1C4746', // 深藍綠
      textSecondary: '#4E8B89', // 湖水綠
      border: '#E4ECEC',
      slotBg: '#D5EAE7',
      slotText: '#103B3A',
      headerBg: '#4E8B89',
      headerText: '#FFFFFF',
      accent: '#C5A880', // 古銅金
      cardBg: 'rgba(255, 255, 255, 0.95)'
    },
    decorations: {
      topLeft: `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-10,-10 L150,-10 L-10,150 Z" fill="#E2EEEB" opacity="0.6"/>
          <line x1="0" y1="0" x2="160" y2="160" stroke="#D6C0A1" stroke-width="1"/>
          <line x1="0" y1="0" x2="150" y2="150" stroke="#4E8B89" stroke-width="0.5" stroke-dasharray="2 2"/>
        </svg>
      `,
      bottomRight: `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M210,210 L50,210 L210,50 Z" fill="#E2EEEB" opacity="0.6"/>
          <line x1="200" y1="200" x2="40" y2="40" stroke="#D6C0A1" stroke-width="1"/>
        </svg>
      `,
      leafIcon: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="9" stroke-dasharray="2 2"/>
          <path d="M8 12h8M12 8v8"/>
        </svg>
      `
    }
  },
  pinkFloral: {
    id: 'pinkFloral',
    name: '春櫻浪漫粉 (Pink Floral)',
    fontFamily: '"Noto Serif TC", "Playfair Display", Georgia, serif',
    layout: 'footer',
    colors: {
      background: '#FAF2F3',
      textPrimary: '#7D3E42', // 深櫻粉
      textSecondary: '#E2979C', // 櫻花粉
      border: '#F7ECEF',
      slotBg: '#FADCE1',
      slotText: '#6C2529',
      headerBg: '#E2979C',
      headerText: '#FFFFFF',
      accent: '#D4AF37', // 金
      cardBg: 'rgba(255, 255, 255, 0.94)'
    },
    decorations: {
      topLeft: `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 簡約水彩花朵 SVG -->
          <circle cx="30" cy="30" r="40" fill="#FCE5E7" opacity="0.7"/>
          <circle cx="60" cy="40" r="30" fill="#FAD1D5" opacity="0.6"/>
          <circle cx="40" cy="70" r="35" fill="#FCDFE2" opacity="0.6"/>
          <path d="M0,0 C 50,20, 80,50, 90,90" stroke="#E2979C" stroke-width="1" stroke-dasharray="2 4"/>
        </svg>
      `,
      bottomRight: `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="170" cy="170" r="40" fill="#FCE5E7" opacity="0.7"/>
          <circle cx="140" cy="160" r="30" fill="#FAD1D5" opacity="0.6"/>
          <circle cx="160" cy="130" r="35" fill="#FCDFE2" opacity="0.6"/>
          <path d="M200,200 C 150,180, 120,150, 110,110" stroke="#E2979C" stroke-width="1" stroke-dasharray="2 4"/>
        </svg>
      `,
      leafIcon: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Zm0 17a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" fill="#FCE9EB"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
      `
    }
  }
};;
