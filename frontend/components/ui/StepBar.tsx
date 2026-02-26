import { clsx } from "clsx";
import { Check } from "lucide-react";

const STEPS = [
  { n: 1, label: "Company" },
  { n: 2, label: "Tax Rules" },
  { n: 3, label: "Upload CSV" },
  { n: 4, label: "Preview" },
  { n: 5, label: "Download" },
];

interface StepBarProps {
  current: number;
}

export function StepBar({ current }: StepBarProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const done = step.n < current;
          const active = step.n === current;
          return (
            <li key={step.n} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={clsx(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                    done && "bg-[#0f3460] border-[#0f3460] text-white",
                    active && "bg-white border-[#0f3460] text-[#0f3460] shadow-md",
                    !done && !active && "bg-white border-gray-300 text-gray-400"
                  )}
                >
                  {done ? <Check className="w-4 h-4" /> : step.n}
                </div>
                <span
                  className={clsx(
                    "text-xs font-medium hidden sm:block",
                    active ? "text-[#0f3460]" : done ? "text-[#0f3460]" : "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={clsx(
                    "h-0.5 flex-1 mx-1 transition-all",
                    done ? "bg-[#0f3460]" : "bg-gray-200"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
