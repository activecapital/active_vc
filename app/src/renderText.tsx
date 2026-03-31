import React from 'react'

export function renderTextWithBreaks(text: string): React.ReactNode {
  const parts = text.includes('\\n')
    ? text.split('\\n')
    : text.split('\n')

  if (parts.length <= 1) return text

  return parts.map((line, i) => (
    <React.Fragment key={i}>
      {line.trim()}
      {i < parts.length - 1 && <br />}
    </React.Fragment>
  ))
}
