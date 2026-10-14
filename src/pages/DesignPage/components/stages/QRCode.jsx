import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

/** 🟦 مكون QR بسيط — يستقبل url ويرسمه على canvas */
export default function QRCodeImage({ url, size = 200, bgColor = '#ffffff', fgColor = '#14294b' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!url || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: 'H',
    }).catch(() => {});
  }, [url, size, bgColor, fgColor]);

  if (!url) return null;
  return <canvas ref={canvasRef} className="qr-canvas" />;
}