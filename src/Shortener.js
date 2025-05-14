import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = 'http://localhost:5000/api';

function Shortener() {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to shorten URLs');
      }

      const response = await fetch(`${API_URL}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          longUrl: url,
          customAlias: customAlias || undefined,
          expiresAt: expiresAt || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      setShortUrl(data.shortUrl);
      setQrCode(data.shortUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-code');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'qrcode.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="shortener">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your long URL"
            required
          />
        </div>

        <div className="options">
          <div className="option-group">
            <label>Custom Alias (optional)</label>
            <input
              type="text"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              placeholder="Enter custom alias"
              pattern="[a-zA-Z0-9-_]+"
              title="Only letters, numbers, hyphens, and underscores allowed"
            />
          </div>

          <div className="option-group">
            <label>Expiration Date (optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {shortUrl && (
        <div className="result">
          <div className="short-url">
            <input
              type="text"
              value={shortUrl}
              readOnly
            />
            <button onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="qr-code">
            <QRCodeSVG
              id="qr-code"
              value={qrCode}
              size={200}
              level="H"
              includeMargin={true}
            />
            <button onClick={handleDownloadQR}>
              Download QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shortener; 