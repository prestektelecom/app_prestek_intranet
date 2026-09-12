import React from 'react';

export default function CalendarDay({ day, isToday, active, onClick, isAdmin }) {
    let classes = "w-full aspect-square flex flex-col items-center justify-center text-xs rounded-full font-bold transition-all duration-300 relative group overflow-hidden ";

    if (isAdmin) {
        classes += "cursor-pointer hover:scale-110 active:scale-95 hover:shadow-sm ";
    } else {
        classes += "cursor-default ";
    }

    if (isToday) {
        classes += "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/40 z-10 ";
    } else if (active) {
        classes += "text-foreground hover:bg-[var(--accent-soft)] border border-border bg-surface ";
    } else {
        classes += "text-foreground/40 hover:text-foreground hover:bg-surface-raised ";
    }

    return (
        <button onClick={onClick} className={classes} title={isAdmin ? 'Gerenciar plantão' : undefined} aria-label={`Dia ${day}${active ? ', tem plantão' : ''}${isToday ? ', hoje' : ''}`}>
            {isAdmin && <div className="absolute inset-0 bg-foreground opacity-0 group-hover:opacity-[0.04] transition-opacity"></div>}
            <span className="relative z-10">{day}</span>
            {active && !isToday && (
                <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full absolute bottom-1.5 left-1/2 -translate-x-1/2 shadow-sm"></div>
            )}
        </button>
    );
}
