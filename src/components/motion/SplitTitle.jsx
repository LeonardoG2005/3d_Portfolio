// Splits a heading into words and letters that rise from behind a mask.
// The parent animates `.split-char`; the real text stays available through aria-label.
export default function SplitTitle({ text, as: Tag = 'h1', className = '', ...props }) {
  const words = String(text).split(' ');
  return (
    <Tag className={className} aria-label={text} {...props}>
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} aria-hidden="true">
          <span className="split-word">
            {Array.from(word).map((char, charIndex) => (
              <span key={charIndex} className="split-char">
                {char}
              </span>
            ))}
          </span>
          {wordIndex < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
