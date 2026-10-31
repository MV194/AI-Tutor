import React from "react";
import { InlineMath, BlockMath } from "react-katex";

// Parse LaTeX-like sub and superscripts (e.g. C_6 or C_{14} or H_{2n+2}) to build native <sub> and <sup> tags
// This is extremely helpful for organic chemistry representation and mathematical powers.
export function parseMathFormula(text: string): React.ReactNode {
  if (!text) return "";

  // Match expressions like _{14}, _6, _n, ^{2n+2}, ^2, ^e precisely to prevent greedy swallowing of subsequent compound elements
  const regex = /(_\{[^}]+\}|_[0-9]+|_[a-zA-Z]|\^\{[^}]+\}|\^[0-9]+|\^[a-zA-Z])/g;
  const parts = text.split(regex);
  if (parts.length === 1) {
    return text;
  }

  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;
        if (part.startsWith("_")) {
          let val = "";
          if (part.startsWith("_{") && part.endsWith("}")) {
            val = part.substring(2, part.length - 1);
          } else {
            val = part.substring(1);
          }
          return (
            <sub 
              key={`sub-${idx}`} 
              className="text-[0.78em] font-extrabold leading-none font-sans text-indigo-700 dark:text-sky-400 select-all tracking-tight mx-[0.02em] align-baseline relative bottom-[-0.18em]"
            >
              {val}
            </sub>
          );
        } else if (part.startsWith("^")) {
          let val = "";
          if (part.startsWith("^{") && part.endsWith("}")) {
            val = part.substring(2, part.length - 1);
          } else {
            val = part.substring(1);
          }
          return (
            <sup 
              key={`sup-${idx}`} 
              className="text-[0.78em] font-extrabold leading-none font-sans text-rose-600 dark:text-rose-400 select-all tracking-tight mx-[0.02em] align-baseline relative top-[-0.32em]"
            >
              {val}
            </sup>
          );
        }
        return part;
      })}
    </>
  );
}

// Helper to check if text represents a chemical structural formula chain
export function isLikelyChemicalChain(text: string): boolean {
  if (!text) return false;
  // Clean LaTeX notation that is often mixed, e.g. \text{CH} or inside math
  const clean = text
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\text/g, "")
    .replace(/\\([\(\)]|\[|\])/g, "")
    .trim();
  
  // A structural chemical chain has at least 1 bond/linker character: (-), (=), or (≡ / \equiv)
  const bondCount = (clean.match(/[-=≡]/g) || []).length || (clean.match(/\\equiv/g) || []).length;
  // And refers to common chemistry markers like C, H, N, O, P, S, etc.
  const hasChemicalSymbols = /C[H|O|N|S|P|F|Cl|Br|I]|H[0-9]|N[H|O]|O[H]|S[O]/i.test(clean);
  
  return bondCount >= 1 && hasChemicalSymbols;
}

// Render a premium, visual chemical formula container matching the screenshots from the user request
export function renderChemicalChain(rawText: string): React.ReactNode {
  // Clear any persistent LaTeX formatting blocks
  const clean = rawText
    .replace(/\\text\{([^}]+)\}/g, "$1") // Simplify \text{CH} -> CH
    .replace(/\\text/g, "")
    .replace(/\\[\(\)]/g, "") // Eliminate \( and \)
    .trim();

  // Split on bonds (single -, double =, triple ≡ / \equiv) while retaining the delimiters using regex groups
  const separatorRegex = /(\s*-\s*|\s*=\s*|\s*\\equiv\s*|\s*≡\s*)/g;
  const tokens = clean.split(separatorRegex);

  return (
    <span className="my-2.5 inline-block max-w-full align-middle select-all">
      <span className="inline-flex items-center flex-wrap gap-y-1.5 px-4.5 py-3 rounded-xl bg-[#E3EFFB] dark:bg-sky-950/45 border border-[#B9D5F3] dark:border-sky-900/70 shadow-sm text-sky-950 dark:text-sky-100 font-sans text-sm sm:text-base md:text-lg font-black tracking-normal">
        {tokens.map((token, idx) => {
          if (!token) return null;
          
          const isSingleBond = /^\s*-\s*$/.test(token);
          const isDoubleBond = /^\s*=\s*$/.test(token);
          const isTripleBond = /^\s*(\\equiv|≡)\s*$/.test(token);

          if (isSingleBond) {
            return (
              <span key={`bond-${idx}`} className="mx-2 md:mx-3 text-[#3B82F6] dark:text-sky-400 font-sans font-black select-none">
                –
              </span>
            );
          }
          if (isDoubleBond) {
            return (
              <span key={`bond-${idx}`} className="mx-2 md:mx-3 text-[#3B82F6] dark:text-sky-450 font-sans font-black select-none tracking-tighter">
                ==
              </span>
            );
          }
          if (isTripleBond) {
            return (
              <span key={`bond-${idx}`} className="mx-2 md:mx-3 text-[#3B82F6] dark:text-sky-400 font-sans font-black select-none">
                ≡
              </span>
            );
          }

          // Otherwise parse as compound chemical formula group to add beautiful subscription
          return (
            <span key={`comp-${idx}`} className="inline-flex items-center text-zinc-900 dark:text-zinc-50 font-bold select-all tracking-wide">
              {parseChemicalGroupElement(token)}
            </span>
          );
        })}
      </span>
    </span>
  );
}

// Parses chemical group names (e.g. CH3, C6, H14) and renders subscripts cleanly
function parseChemicalGroupElement(groupName: string): React.ReactNode {
  // Normalize LaTeX subscript representations first (e.g. CH_3 or CH_{3} -> CH3)
  let text = groupName.replace(/_\{?([0-9n\+\-]+)\}?/g, "$1");

  // Split on digit boundaries to format numbers as perfect subscripts
  const parts = text.split(/([0-9]+)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        const isNumber = /^[0-9]+$/.test(part);
        if (isNumber) {
          return (
            <sub 
              key={index} 
              className="text-[0.72em] font-extrabold text-[#1A56A3] dark:text-sky-300 align-baseline relative bottom-[-0.22em] leading-none mx-0.5 select-all"
            >
              {part}
            </sub>
          );
        }
        return part;
      })}
    </>
  );
}

// Sub-parser for bold text marked by double asterisks **
function parseBoldMarkup(text: string): React.ReactNode {
  const parts = text.split("**");
  if (parts.length > 1) {
    return (
      <>
        {parts.map((part, idx) => {
          const isBold = idx % 2 === 1;
          if (isBold) {
            return (
              <strong key={`bold-${idx}`} className="font-extrabold text-zinc-900 dark:text-white">
                {parseMathFormula(part)}
              </strong>
            );
          }
          return <React.Fragment key={`math-wrap-${idx}`}>{parseMathFormula(part)}</React.Fragment>;
        })}
      </>
    );
  }
  return parseMathFormula(text);
}

// Sub-parser for code backticks (`) and bold (**)
function parseOtherInlineMarkups(text: string): React.ReactNode {
  const codeParts = text.split("`");
  if (codeParts.length > 1) {
    return (
      <>
        {codeParts.map((codePart, cIdx) => {
          const isCode = cIdx % 2 === 1;
          if (isCode) {
            return (
              <code 
                key={`inline-code-${cIdx}`} 
                className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-rose-600 dark:text-rose-400 font-mono text-xs font-semibold rounded border border-zinc-200 dark:border-zinc-700 mx-0.5"
              >
                {codePart}
              </code>
            );
          }
          return <React.Fragment key={`bold-wrap-${cIdx}`}>{parseBoldMarkup(codePart)}</React.Fragment>;
        })}
      </>
    );
  }

  return parseBoldMarkup(text);
}

// Sub-parser for inline elements: standard text, bold (**), inline code (`), and inline LaTeX ($)
function parseInlineMarkdown(text: string): React.ReactNode {
  if (!text) return "";

  // Parse LaTeX math inline blocks marked by single $ first
  const dollarParts = text.split("$");
  if (dollarParts.length > 1) {
    return (
      <>
        {dollarParts.map((dollarPart, dIdx) => {
          const isMath = dIdx % 2 === 1;
          if (isMath) {
            if (isLikelyChemicalChain(dollarPart)) {
              return (
                <span key={`chem-${dIdx}`} className="inline-block">
                  {renderChemicalChain(dollarPart)}
                </span>
              );
            }
            return (
              <span 
                key={`inline-math-${dIdx}`} 
                className="px-1.5 py-0.5 bg-indigo-50/20 dark:bg-indigo-950/15 text-indigo-850 dark:text-sky-300 rounded border border-indigo-100/50 dark:border-indigo-900/30 inline-flex items-center align-middle font-sans"
              >
                <InlineMath 
                  math={dollarPart} 
                  renderError={() => (
                    <span className="font-semibold text-indigo-700 dark:text-sky-400">
                      {dollarPart}
                    </span>
                  )}
                />
              </span>
            );
          }
          return <React.Fragment key={`inline-other-${dIdx}`}>{parseOtherInlineMarkups(dollarPart)}</React.Fragment>;
        })}
      </>
    );
  }

  return parseOtherInlineMarkups(text);
}

// Decodes latex inline/block formulas, bold text, backtick code, and markdown tables/lists
export function renderRichAcademicText(text: string): React.ReactNode {
  if (!text) return null;

  // Pre-normalize LaTeX delimiters to standard $ and $$ markup
  const normalizedText = text
    .replace(/\\\[/g, "\n$$\n")
    .replace(/\\\]/g, "\n$$\n")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");

  // Split into lines to find tables, lists, and quotes
  const lines = normalizedText.split("\n");
  const elements: React.ReactNode[] = [];
  let currentTableRows: string[][] = [];
  let inTable = false;
  let currentListItems: string[] = [];
  let inList = false;

  const flushList = (key: string) => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc ml-5 my-2 pl-1 space-y-1 text-zinc-650 dark:text-zinc-300">
          {currentListItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      currentListItems = [];
      inList = false;
    }
  };

  const flushTable = (key: string) => {
    if (currentTableRows.length > 0) {
      let headers: string[] = [];
      let rows: string[][] = [];

      if (currentTableRows.length >= 1) {
        headers = currentTableRows[0];
      }
      if (currentTableRows.length >= 2) {
        const potentialDelim = currentTableRows[1].join("");
        if (potentialDelim.includes("---") || potentialDelim.includes("-")) {
          rows = currentTableRows.slice(2);
        } else {
          rows = currentTableRows.slice(1);
        }
      }

      elements.push(
        <div key={`table-container-${key}`} className="my-3.5 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-xs bg-white dark:bg-zinc-900">
            <thead className="bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-700 dark:text-zinc-300 font-extrabold uppercase tracking-wider">
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 font-bold">
                    {parseInlineMarkdown(h.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 bg-white dark:bg-zinc-900 text-zinc-650 dark:text-zinc-300">
              {rows.map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className={rowIdx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50/40 dark:bg-zinc-950/20"}
                >
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-3 whitespace-nowrap">
                      {parseInlineMarkdown(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if line is a table row starting and ending with |
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList(`l-${i}`);
      const cells = trimmed
        .split("|")
        .slice(1, -1); // remove outer empty elements from splitting |text|
      currentTableRows.push(cells);
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable(`tbl-${i}`);
    }

    // Check if line is a list item starting with "- " or "* " (avoid line breakers)
    if ((trimmed.startsWith("-") || trimmed.startsWith("*")) && !trimmed.startsWith("---") && !trimmed.startsWith("***") && trimmed.length > 1 && (trimmed[1] === " " || trimmed[1] === "\t")) {
      const itemContent = trimmed.substring(2).trim();
      currentListItems.push(itemContent);
      inList = true;
      continue;
    } else if (inList) {
      flushList(`lst-${i}`);
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteContent = trimmed.substring(1).trim();
      elements.push(
        <div key={`quote-${i}`} className="my-3 pl-4 py-2 border-l-4 border-indigo-505/60 text-zinc-650 dark:text-zinc-350 bg-zinc-55/40 dark:bg-zinc-950/10 rounded-r-lg italic leading-relaxed">
          {parseInlineMarkdown(quoteContent)}
        </div>
      );
      continue;
    }

    // Standalone LaTeX Block math $$
    if (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length > 4) {
      const math = trimmed.substring(2, trimmed.length - 2).trim();
      if (isLikelyChemicalChain(math)) {
        elements.push(
          <div key={`chem-block-${i}`} className="w-full flex justify-center my-3.5">
            {renderChemicalChain(math)}
          </div>
        );
      } else {
        elements.push(
          <div 
            key={`math-block-${i}`} 
            className="my-4 p-5 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-900 dark:text-zinc-50 rounded-2xl overflow-x-auto text-sm sm:text-base border border-zinc-150 dark:border-zinc-800/50 shadow-sm flex justify-center items-center"
          >
            <BlockMath 
              math={math} 
              renderError={() => (
                <div className="font-mono text-xs text-rose-500 text-center">
                  Error parsing LaTeX: {math}
                </div>
              )}
            />
          </div>
        );
      }
      continue;
    }

    // Empty paragraph or separator line
    if (trimmed === "" || trimmed === "---" || trimmed === "***") {
      if (trimmed === "---" || trimmed === "***") {
        elements.push(<hr key={`hr-${i}`} className="my-4 border-t border-zinc-200 dark:border-zinc-800" />);
      }
      continue;
    }

    // Default paragraph
    elements.push(
      <p key={`p-${i}`} className="leading-relaxed my-1.5 text-zinc-700 dark:text-zinc-300">
        {parseInlineMarkdown(line)}
      </p>
    );
  }

  // Final flush
  flushList("final");
  flushTable("final");

  return <div className="space-y-1 font-sans text-xs sm:text-sm">{elements}</div>;
}
