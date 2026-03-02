import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { EquipmentType } from '../../types/dashboard';

interface EquipmentOption {
  value: EquipmentType;
  label: string;
  emoji: string;
  bg: string;
  color: string;
  dot: string;
}

const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  { value: 'Unsigned', label: 'Unsigned', emoji: '❓', bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  { value: 'Van',      label: 'Van',      emoji: '🚐', bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  { value: 'Reefer',   label: 'Reefer',   emoji: '❄️', bg: '#f0fdf4', color: '#065f46', dot: '#10b981' },
  { value: 'Flat Bed', label: 'Flat Bed', emoji: '🛻', bg: '#fff7ed', color: '#9a3412', dot: '#f97316' },
];

interface Props {
  value: EquipmentType;
  onChange: (equipment: EquipmentType) => void;
}

export default function EquipmentDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const current = EQUIPMENT_OPTIONS.find(o => o.value === value) ?? EQUIPMENT_OPTIONS[0];

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverH = 200;

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

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

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

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleSelect = (option: EquipmentOption) => {
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div className="sdd-root">
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

      {open && createPortal(
        <div
          ref={popoverRef}
          className="sdd-popover"
          role="listbox"
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          <div className="sdd-popover-label">Change equipment</div>
          {EQUIPMENT_OPTIONS.map(option => {
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
