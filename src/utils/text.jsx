import React from "react";

// Matches http/https URLs (stops at whitespace and common delimiters)
const URL_RE = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;

/**
 * Splits a plain string into text nodes + clickable <a> tags for any URLs found.
 * `keyPrefix` keeps React keys unique across calls.
 */
function linkifySegment(text, keyPrefix) {
  const result = [];
  let last = 0;
  let match;
  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    if (match.index > last) result.push(text.slice(last, match.index));
    const url = match[0];
    result.push(
      <a
        key={`${keyPrefix}_${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "inherit", textDecoration: "underline", wordBreak: "break-all" }}
      >
        {url}
      </a>
    );
    last = match.index + url.length;
  }
  if (last < text.length) result.push(text.slice(last));
  return result;
}

/**
 * processInline(text)
 *
 * Renders a string with:
 *   - **bold** → <strong>
 *   - https://... → clickable <a>
 *
 * Returns an array of strings and React elements suitable for use as
 * children of any inline or block container.
 */
export function processInline(text) {
  if (!text) return null;
  const boldParts = text.split(/\*\*([^*]+)\*\*/g);
  return boldParts.flatMap((part, i) => {
    if (i % 2 === 1) {
      return [<strong key={`b${i}`} style={{ fontWeight: 600 }}>{part}</strong>];
    }
    return linkifySegment(part, `s${i}`);
  });
}
