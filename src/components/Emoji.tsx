import React from 'react';

/**
 * Renders a single emoji as a Twemoji SVG image (via jsDelivr CDN).
 * Gives crisp, consistent cross-platform appearance instead of relying on
 * the OS emoji font.
 *
 * Usage:
 *   <Emoji symbol="🚚" size={18} label="Truck" />
 */

function emojiToCodePoint(emoji: string): string {
  const points: string[] = [];
  const chars = [...emoji]; // spread to handle surrogate pairs
  for (const char of chars) {
    const cp = char.codePointAt(0);
    if (cp === undefined) continue;
    if (cp === 0xfe0f) continue; // skip variation selector-16
    if (cp === 0x200d) {
      points.push('200d');       // keep ZWJ for sequences like 👨‍💼
      continue;
    }
    points.push(cp.toString(16));
  }
  return points.join('-');
}

interface EmojiProps {
  symbol: string;
  size?: number | string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Emoji({ symbol, size = 18, label, className, style }: EmojiProps) {
  const cp  = emojiToCodePoint(symbol);
  const src = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cp}.svg`;

  return (
    <img
      src={src}
      alt={label ?? symbol}
      title={label}
      draggable={false}
      className={className}
      style={{
        width:          size,
        height:         size,
        display:        'inline-block',
        verticalAlign:  'middle',
        flexShrink:     0,
        ...style,
      }}
    />
  );
}

export default Emoji;
