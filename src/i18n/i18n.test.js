import { describe, expect, it } from 'vitest';
import en from './en.js';
import es from './es.js';

function shape(node, path = '') {
  if (Array.isArray(node)) return [`${path}[${node.length}]`, ...node.flatMap((item, i) => (typeof item === 'object' ? shape(item, `${path}.${i}`) : []))];
  if (node && typeof node === 'object') return Object.keys(node).flatMap((key) => shape(node[key], path ? `${path}.${key}` : key));
  return [path];
}

function strings(node) {
  if (typeof node === 'string') return [node];
  if (node && typeof node === 'object') return Object.values(node).flatMap(strings);
  return [];
}

describe('translations', () => {
  it('have the same keys and list lengths in English and Spanish', () => {
    expect(shape(es).sort()).toEqual(shape(en).sort());
  });

  it('avoid long dashes in visible copy', () => {
    for (const text of [...strings(en), ...strings(es)]) expect(text).not.toMatch(/[\u2013\u2014]/);
  });
});
