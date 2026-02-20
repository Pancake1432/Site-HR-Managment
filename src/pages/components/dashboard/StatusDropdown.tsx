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
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'Applied',        label: 'Applied',   emoji: '📩', bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  { value: 'Contacted',      label: 'Contacted', emoji: '📞', bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  { value: 'Documents Sent', label: 'Docs Sent', emoji: '📋', bg: '#f0fdf4', color: '#065f46', dot: '#10b981' },
];

interface Props {
  value: StatusType;
  onChange: (status: StatusType) => void;
}

export default function StatusDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const current = STATUS_OPTIONS.find(o => o.value === value)!;

  // Calculate position from the trigger button's bounding rect
  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Try to place below; if not enough room place above
    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverH = 160; // approximate height

    const top = spaceBelow >= popoverH
      ? rect.bottom + scrollY + 8
      : rect.top  + scrollY - popoverH - 8;

    // Center under trigger, clamped to viewport
    const popoverW = 190;
    let left = rect.left + scrollX + rect.width / 2 - popoverW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth + scrollX - popoverW - 8));

    setPopoverPos({ top, left });
  }, []);

  const handleOpen = () => {
    calcPosition();
    setOpen(prev => !prev);
  };

  // Recalc on scroll / resize
  useEffect(() => {
    if (!open) return;
    const update = () => calcPosition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, calcPosition]);

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

  return (
    <div className="sdd-root">
      {/* ── TRIGGER PILL ── */}
      <button
        ref={triggerRef}
        className={`sdd-trigger ${open ? 'sdd-trigger--open' : ''}`}
        style={{ background: current.bg, color: current.color }}
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

      {/* ── POPOVER — rendered via portal so it escapes overflow:hidden/auto ── */}
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
