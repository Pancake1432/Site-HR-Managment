import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { StatusType } from '../../types/dashboard';

interface StatusOption {
  value: StatusType;
  label: string;
  emoji: string;
  bg: string;
  color: string;
  dot: string;
  darkBg: string;
  darkColor: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'Applied',        label: 'Applied',   emoji: '📩', bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6', darkBg: 'rgba(59,130,246,0.15)', darkColor: '#93c5fd' },
  { value: 'Contacted',      label: 'Contacted', emoji: '📞', bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' , darkBg: 'rgba(249,115,22,0.15)', darkColor: '#fdba74' },
  { value: 'Documents Sent', label: 'Docs Sent', emoji: '📋', bg: '#f0fdf4', color: '#065f46', dot: '#10b981' , darkBg: 'rgba(16,185,129,0.15)', darkColor: '#6ee7b7' },
];

interface Props {
  value: StatusType;
  onChange: (status: StatusType) => void;
}

export default function StatusDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

    // Watch for dark mode toggling
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const current = STATUS_OPTIONS.find(o => o.value === value)!;

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverH = 160;

    const top = spaceBelow >= popoverH
      ? rect.bottom + 8
      : rect.top - popoverH - 8;

    const popoverW = 190;
    let left = rect.left + rect.width / 2 - popoverW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - popoverW - 8));

    setPopoverPos({ top, left });
  }, []);

  const handleOpen = () => {
    calcPosition();
    setOpen(prev => !prev);
  };

  // Close on ANY scroll anywhere (captures inner scroll containers too)
  // and close on resize — this is the standard approach used by Radix, Headless UI, etc.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);   // true = capture, catches inner divs
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        popoverRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleSelect = (option: StatusOption) => {
    onChange(option.value);
    setOpen(false);
  };

  const getTriggerBg = (opt: StatusOption) => isDark ? opt.darkBg : opt.bg;
  const getTriggerColor = (opt: StatusOption) => isDark ? opt.darkColor : opt.color;

  return (
    <div className="sdd-root">
      <button
        ref={triggerRef}
        className={`sdd-trigger ${open ? 'sdd-trigger--open' : ''}`}
        style={{ background: getTriggerBg(current), color: getTriggerColor(current) }}
        onClick={handleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="sdd-dot" style={{ background: current.dot }} />
        <span className="sdd-label">{current.label}</span>
        <span className={`sdd-chevron ${open ? 'sdd-chevron--up' : ''}`}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && createPortal(
        <div
          ref={popoverRef}
          className="sdd-popover"
          role="listbox"
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          <div className="sdd-popover-label">Change status</div>
          {STATUS_OPTIONS.map(option => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                className={`sdd-option ${isSelected ? 'sdd-option--active' : ''}`}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={isSelected}
              >
                <span className="sdd-option-dot" style={{ background: option.dot }} />
                <span className="sdd-option-emoji">{option.emoji}</span>
                <span className="sdd-option-text">{option.label}</span>
                {isSelected && (
                  <span className="sdd-option-check">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
