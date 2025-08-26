import { DateTime } from "luxon";
import { useState } from "preact/hooks";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface CalendarProps {
  value?: string;
  onChange: (event: { target: { name: string; value: string } }) => void;
}

export default function Calendar({ value, onChange }: CalendarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedDate = value ? DateTime.fromISO(value).toJSDate() : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const newValue = DateTime.fromJSDate(date).toISODate() ?? "";
      onChange({ target: { name: "birthdate", value: newValue } });
    }
    setIsOpen(false);
  };

  return (
    <div class="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        class="w-full rounded-xl border border-gray-300 bg-white p-2 text-left"
      >
        {selectedDate ? (
          DateTime.fromJSDate(selectedDate)
            .setLocale("fr")
            .toFormat("dd MMMM yyyy")
        ) : (
          <span class="text-gray-400">Sélectionner une date...</span>
        )}
      </button>

      {isOpen && (
        <div class="absolute z-10 mt-2 rounded-xl border border-gray-300 bg-white px-4 py-2 shadow-lg">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            captionLayout="dropdown"
          />
        </div>
      )}
    </div>
  );
}
