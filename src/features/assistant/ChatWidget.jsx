import { ArrowRight, MessageCircle, Send, X } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { FAQS } from '../../data/faqs.js';
import { useT } from '../../i18n/index.jsx';
import { matchIntent } from './matcher.js';

const QUESTION_IDS = ['who', 'tech', 'projects', 'experience', 'english', 'education', 'availability', 'cv', 'contact', 'cloud', 'ai'];

// Scripted assistant: prepared answers picked by keyword matching. No network, no AI model.
// Messages store translation keys, so the conversation follows the language switch.
export default function ChatWidget() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', key: 'chat.welcome' }]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const input = useRef(null);
  const log = useRef(null);
  const toggleButton = useRef(null);
  const timer = useRef(0);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const close = () => {
    setOpen(false);
    toggleButton.current?.focus();
  };

  const reply = (intent) => {
    const faq = FAQS.find((item) => item.id === intent);
    setTyping(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setTyping(false);
        setMessages((list) => [
          ...list,
          faq ? { from: 'bot', key: `chat.answers.${faq.id}`, route: faq.route } : { from: 'bot', key: 'chat.fallback', fallback: true },
        ]);
      },
      550 + Math.random() * 450,
    );
  };

  const ask = (text, intent) => {
    const clean = text.trim();
    if (!clean || typing) return;
    setMessages((list) => [...list, { from: 'user', text: clean }]);
    setDraft('');
    reply(intent ?? matchIntent(clean));
  };

  const askSuggested = (id) => {
    if (typing) return;
    setMessages((list) => [...list, { from: 'user', key: `chat.questions.${id}` }]);
    reply(id);
  };

  return (
    <>
      <button
        ref={toggleButton}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="assistant-panel"
        aria-label={open ? t('chat.close') : t('chat.open')}
        title={open ? t('chat.close') : t('chat.open')}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-accent text-on-accent shadow-card transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X size={24} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {open && (
          <m.section
            id="assistant-panel"
            role="dialog"
            aria-label={t('chat.title')}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onKeyDown={(event) => event.key === 'Escape' && close()}
            className="fixed bottom-24 left-3 right-3 z-40 flex max-h-[min(34rem,calc(100dvh-8rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:left-auto sm:right-5 sm:w-[23rem]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <h2 className="font-display text-base font-semibold">{t('chat.title')}</h2>
                <p className="text-xs text-muted">{t('chat.disclaimer')}</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t('chat.close')}
                className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-raised"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div ref={log} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      message.from === 'user' ? 'rounded-br-md bg-accent text-on-accent' : 'rounded-bl-md bg-raised'
                    }`}
                  >
                    <span className="sr-only">{message.from === 'user' ? t('chat.you') : t('chat.assistant')}: </span>
                    {message.key ? t(message.key) : message.text}
                    {message.route && (
                      <Link to={message.route} className="link mt-2 flex items-center gap-1 text-[0.8125rem] font-semibold">
                        {t('chat.open_page')}
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    )}
                    {message.fallback && (
                      <Link to="/contact" className="link mt-2 flex items-center gap-1 text-[0.8125rem] font-semibold">
                        {t('nav.contact')}
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-raised px-4 py-3.5">
                    <span className="sr-only">{t('chat.typing')}</span>
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
                        style={{ animationDelay: `${dot * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-line px-3 pt-2.5">
              <p className="sr-only" id="assistant-suggestions">
                {t('chat.suggestions_label')}
              </p>
              <ul aria-labelledby="assistant-suggestions" className="flex gap-2 overflow-x-auto pb-2.5 [scrollbar-width:thin]">
                {QUESTION_IDS.map((id) => (
                  <li key={id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => askSuggested(id)}
                      disabled={typing}
                      className="h-8 rounded-full border border-line bg-surface px-3 text-xs font-medium hover:border-accent-ink disabled:opacity-50"
                    >
                      {t(`chat.questions.${id}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <form
              className="flex items-center gap-2 px-3 pb-3"
              onSubmit={(event) => {
                event.preventDefault();
                ask(draft);
              }}
            >
              <label htmlFor="assistant-input" className="sr-only">
                {t('chat.placeholder')}
              </label>
              <input
                id="assistant-input"
                ref={input}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t('chat.placeholder')}
                autoComplete="off"
                maxLength={200}
                className="h-11 min-w-0 flex-1 rounded-full border border-line bg-bg px-4 text-sm outline-none placeholder:text-muted focus:border-accent-ink"
              />
              <button
                type="submit"
                disabled={!draft.trim() || typing}
                aria-label={t('chat.send')}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-opacity disabled:opacity-40"
              >
                <Send size={18} aria-hidden="true" />
              </button>
            </form>
          </m.section>
        )}
      </AnimatePresence>
    </>
  );
}
