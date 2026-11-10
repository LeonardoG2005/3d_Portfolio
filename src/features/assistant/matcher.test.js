import { describe, expect, it } from 'vitest';
import en from '../../i18n/en.js';
import es from '../../i18n/es.js';
import { matchIntent } from './matcher.js';

describe('assistant matcher', () => {
  it('answers every suggested question in both languages', () => {
    for (const dictionary of [en, es]) {
      for (const [id, question] of Object.entries(dictionary.chat.questions)) {
        expect(matchIntent(question), question).toBe(id);
      }
    }
  });

  it('understands free text', () => {
    expect(matchIntent('do you know kubernetes or terraform?')).toBe('cloud');
    expect(matchIntent('Send me your resume please')).toBe('cv');
    expect(matchIntent('¿Dónde vive?')).toBe('location');
    expect(matchIntent('hola')).toBe('greeting');
    expect(matchIntent('how did you make this 3d room')).toBe('site');
    expect(matchIntent('qué lenguajes maneja')).toBe('tech');
  });

  it('returns null for unknown questions', () => {
    expect(matchIntent('what is the weather on mars')).toBeNull();
    expect(matchIntent('   ')).toBeNull();
  });

  it('has an answer for every intent', () => {
    for (const dictionary of [en, es]) {
      for (const id of Object.keys(dictionary.chat.questions)) expect(dictionary.chat.answers[id]).toBeTruthy();
    }
  });
});
