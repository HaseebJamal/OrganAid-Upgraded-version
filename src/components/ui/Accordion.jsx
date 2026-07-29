import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Accordion({
  items = [],
  allowMultiple = false,
}) {
  const [openItems, setOpenItems] = useState([]);

  function toggle(index) {
    if (allowMultiple) {
      setOpenItems((current) =>
        current.includes(index)
          ? current.filter((item) => item !== index)
          : [...current, index]
      );
    } else {
      setOpenItems((current) =>
        current[0] === index ? [] : [index]
      );
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);

        return (
          <div
            key={index}
            className={[
              "overflow-hidden rounded-2xl border bg-white transition-all duration-300",
              isOpen
                ? "border-red-200 shadow-lg shadow-red-100/40"
                : "border-slate-200 hover:border-red-100 hover:shadow-md",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              aria-controls={`accordion-${index}`}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-red-100"
            >
              <span className="text-base font-semibold text-slate-900">
                {item.title}
              </span>

              <span
                className={[
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-300",
                  isOpen
                    ? "rotate-180 bg-red-100 text-red-600"
                    : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                <ChevronDown className="h-5 w-5" />
              </span>
            </button>

            <div
              id={`accordion-${index}`}
              className={[
                "grid transition-all duration-300 ease-in-out",
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              ].join(" ")}
            >
              <div className="overflow-hidden">
                <div className="border-t border-slate-100 px-6 py-5">
                  <div className="leading-7 text-slate-600">
                    {item.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}