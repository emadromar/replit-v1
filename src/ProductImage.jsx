import React, { useState, useEffect } from 'react';

export function ProductImage({ src, alt, className }) {
  const [error, setError] = useState(false);
  useEffect(() => { setError(false); }, [src]);
  const handleError = () => { if (!error) setError(true); };
  const displaySrc = (!src || error) ? `https://placehold.co/200x200/e2e8f0/94a3b8?text=No+Image` : src;
  return <img src={displaySrc} alt={alt} className={className} onError={handleError} loading="lazy" />;
}