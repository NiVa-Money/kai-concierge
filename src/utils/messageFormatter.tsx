// utils/messageFormatter.tsx
import React from "react";

type Elem = React.JSX.Element;

/**
 * Converts plain text with numbered/bullet patterns into semantic HTML.
 * Fixes "1. 1. 1. ..." by grouping consecutive numbered lines into one <ol>.
 */
export const formatMessage = (raw: string): Elem[] => {
  if (!raw) return [];

  // Normalize and insert line breaks before list markers found in single-paragraph responses.
  let content = raw.replace(/\r/g, "");
  content = content.replace(/(?<!\n)(\d+)\.\s/g, "\n$1. "); // newline before "1. "
  content = content.replace(/(?<!\n)\s-\s/g, "\n- "); // newline before " - "
  content = content.replace(/\n{3,}/g, "\n\n"); // compact excessive blank lines

  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  type OLItem = { text: string; subs: string[] };
  let inOL = false;
  let olItems: OLItem[] = [];
  const out: Elem[] = [];

  const closeOL = () => {
    if (!inOL) return;
    const k = out.length;
    out.push(
      <ol key={`ol-${k}`} className="ml-5 list-decimal space-y-1 mb-3">
        {olItems.map((it, i) => (
          <li key={`li-${k}-${i}`} className="text-slate-300">
            <span>{it.text}</span>
            {it.subs.length > 0 && (
              <ul className="ml-5 list-disc mt-1 space-y-1">
                {it.subs.map((s, si) => (
                  <li key={`sub-${k}-${i}-${si}`} className="text-slate-300">
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    );
    inOL = false;
    olItems = [];
  };

  const isHeading = (s: string) =>
    /^[A-Z0-9].*:\s*$/.test(s) || /^#{1,6}\s/.test(s);

  for (const line of lines) {
    // Ordered list item?
    const mNum = line.match(/^\d+\.\s+(.*)$/);
    if (mNum) {
      if (!inOL) {
        inOL = true;
        olItems = [];
      }
      olItems.push({ text: mNum[1].trim(), subs: [] });
      continue;
    }

    // Bullet line? (treated as sub-bullets of the last numbered item when possible)
    const mBullet = line.match(/^-+\s+(.*)$/) || line.match(/^[•-]\s+(.*)$/);
    if (mBullet) {
      if (inOL && olItems.length > 0) {
        olItems[olItems.length - 1].subs.push(mBullet[1].trim());
        continue;
      }
      // Top-level bullet list fallback
      out.push(
        <ul key={`ul-${out.length}`} className="ml-5 list-disc space-y-1 mb-3">
          <li className="text-slate-300">{mBullet[1].trim()}</li>
        </ul>
      );
      continue;
    }

    // Any other line ends the current ordered list.
    closeOL();

    if (isHeading(line)) {
      out.push(
        <h4
          key={`h-${out.length}`}
          className="font-semibold text-white mt-3 mb-2"
        >
          {line.replace(/^#{1,6}\s*/, "")}
        </h4>
      );
    } else {
      out.push(
        <p
          key={`p-${out.length}`}
          className="text-slate-300 mb-2 leading-relaxed"
        >
          {line}
        </p>
      );
    }
  }

  closeOL();
  return out;
};

export default formatMessage;
