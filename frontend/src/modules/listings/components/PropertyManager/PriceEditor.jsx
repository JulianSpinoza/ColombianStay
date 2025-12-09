import React, { useState, useEffect, useRef } from "react";

/**
 * PriceEditor
 * Props:
 * - price (number|string)
 * - onSave(newPrice) -> promise or void
 */
const PriceEditor = ({ price: initialPrice = "", onSave }) => {
  const [value, setValue] = useState(initialPrice === null ? "" : String(initialPrice));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setValue(initialPrice === null ? "" : String(initialPrice));
    setDirty(false);
    setSaved(false);
  }, [initialPrice]);

  const doSave = async (val) => {
    if (val === "" || isNaN(Number(val))) return;
    setSaving(true);
    setSaved(false);
    try {
      if (onSave) await onSave(Number(val));
      // small UI delay for pleasant feedback
      await new Promise((r) => setTimeout(r, 300));
      setSaved(true);
      setDirty(false);
      // clear saved indicator after 2s
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      // Could show error toast
      console.error("Error saving price:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleBlur = () => {
    if (dirty) doSave(value);
  };

  const handleInput = (e) => {
    const raw = e.target.value;
    // Allow only numbers and commas/dots; strip currency symbols
    const cleaned = raw.replace(/[^0-9.]/g, "");
    setValue(cleaned);
    setDirty(cleaned !== String(initialPrice));
  };

  const handleManualSave = () => {
    doSave(value);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Price per night</label>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleInput}
            onBlur={handleBlur}
            className="w-full text-2xl font-semibold px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="e.g. 120000"
          />
          <p className="text-xs text-gray-500 mt-1">Use numbers only. Currency set in account preferences.</p>
        </div>

        <div className="w-36 flex flex-col items-end">
          <button
            type="button"
            onClick={handleManualSave}
            disabled={!dirty || saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${dirty && !saving ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-600 cursor-not-allowed'}`}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <div className="mt-2 text-xs h-4">
            {saved && <span className="text-green-600">✓ Saved</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceEditor;
