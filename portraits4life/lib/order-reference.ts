import { randomInt } from 'node:crypto';

// The reference a customer quotes, for example P4L-261117-K7QM. It is created on the server when an
// order is saved. The date is the German date of the order. The random part has no 0, O, 1 or I,
// so it can be read out and typed without confusion.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const RANDOM_LENGTH = 4;

export const ORDER_REFERENCE_PATTERN = /^P4L-\d{6}-[A-HJ-NP-Z2-9]{4}$/;

function germanDate(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}${value('month')}${value('day')}`;
}

export function createOrderReference(now: Date = new Date()): string {
  let random = '';
  for (let i = 0; i < RANDOM_LENGTH; i++) {
    random += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `P4L-${germanDate(now)}-${random}`;
}
