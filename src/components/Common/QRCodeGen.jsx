import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeGen({ url, color = '#000000', size = 80 }) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (!url) {
      setQrDataUrl('');
      return;
    }

    QRCode.toDataURL(url, {
      width: size * 2, // 2x size for retina resolution
      margin: 1,
      color: {
        dark: color,
        light: '#FFFFFF00' // 設為透明背景，便於融入主卡片
      }
    })
      .then(url => {
        setQrDataUrl(url);
      })
      .catch(err => {
        console.error('QR Code Generation Error:', err);
      });
  }, [url, color, size]);

  if (!url || !qrDataUrl) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          border: '1px dashed #ccc', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '10px',
          color: '#999',
          borderRadius: '4px'
        }}
      >
        QR Code
      </div>
    );
  }

  return (
    <img 
      src={qrDataUrl} 
      alt="預約 QR Code" 
      style={{ 
        width: size, 
        height: size, 
        display: 'block',
        objectFit: 'contain'
      }} 
    />
  );
}
