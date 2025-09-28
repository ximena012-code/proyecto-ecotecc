import React, { useState, useRef, useEffect } from 'react';
import '../style/TextoExpandible.css';

const TextoExpandible = ({ text, maxLines = 4 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
      const height = element.scrollHeight;
      const maxHeight = lineHeight * maxLines;
      setIsOverflowing(height > maxHeight);
    }
  }, [text, maxLines]);

  return (
    <div className="expandable-text-container">
      <div
        ref={textRef}
        className={`expandable-text ${isExpanded ? 'expanded' : ''}`}
        style={{ WebkitLineClamp: isExpanded ? 'unset' : maxLines }}
      >
        {text}
      </div>
      {isOverflowing && (
        <button
          className="expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Ver menos' : 'Ver más...'}
        </button>
      )}
    </div>
  );
};

export default TextoExpandible;