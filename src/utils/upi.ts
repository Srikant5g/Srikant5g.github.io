/**
 * UPI Deep Linking Utilities for TripTally
 * 
 * Provides direct deep links to PhonePe, Google Pay, Paytm, and generic UPI.
 * Specifically solves the issue where generic `upi://pay` automatically routes to WhatsApp Pay.
 */

export interface UpiPaymentParams {
  upiId: string;
  name: string;
  amount: number;
  note?: string;
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/**
 * Direct PhonePe Payment URL
 * - Android: Uses Chrome Intent specifying `package=com.phonepe.app` to force-open PhonePe and bypass WhatsApp.
 * - iOS: Uses `phonepe://upi/pay` scheme to launch the PhonePe app directly.
 */
export function getPhonePeUrl({
  upiId,
  name,
  amount,
  note = 'TripTally Settlement',
}: UpiPaymentParams): string {
  const encVpa = encodeURIComponent(upiId.trim());
  const encName = encodeURIComponent(name.trim());
  const encNote = encodeURIComponent(note.trim());
  const amtStr = amount.toFixed(2);

  if (isAndroid()) {
    // Explicit Chrome Intent to target PhonePe Android App
    return `intent://pay?pa=${encVpa}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}#Intent;scheme=upi;package=com.phonepe.app;end`;
  }

  if (isIOS()) {
    // Direct PhonePe URL scheme for iOS
    return `phonepe://upi/pay?pa=${encVpa}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}`;
  }

  // Fallback
  return `phonepe://pay?pa=${encVpa}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}`;
}

/**
 * Direct Google Pay URL
 * - Android: Targets `com.google.android.apps.nbu.paisa.user`
 * - iOS: Uses `tez://upi/pay`
 */
export function getGPayUrl({
  upiId,
  name,
  amount,
  note = 'TripTally Settlement',
}: UpiPaymentParams): string {
  const encVpa = encodeURIComponent(upiId.trim());
  const encName = encodeURIComponent(name.trim());
  const encNote = encodeURIComponent(note.trim());
  const amtStr = amount.toFixed(2);

  if (isAndroid()) {
    return `intent://pay?pa=${encVpa}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
  }

  return `tez://upi/pay?pa=${encVpa}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}`;
}

/**
 * Direct Paytm URL
 * - Android: Targets `net.one97.paytm`
 * - iOS: Uses `paytmmp://upi/pay`
 */
export function getPaytmUrl({
  upiId,
  name,
  amount,
  note = 'TripTally Settlement',
}: UpiPaymentParams): string {
  const encVpa = encodeURIComponent(upiId.trim());
  const encName = encodeURIComponent(name.trim());
  const encNote = encodeURIComponent(note.trim());
  const amtStr = amount.toFixed(2);

  if (isAndroid()) {
    return `intent://pay?pa=${encVpa}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}#Intent;scheme=upi;package=net.one97.paytm;end`;
  }

  return `paytmmp://upi/pay?pa=${encVpa}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}`;
}

/**
 * Universal UPI URL (standard NPCI format)
 */
export function getUniversalUpiUrl({
  upiId,
  name,
  amount,
  note = 'TripTally Settlement',
}: UpiPaymentParams): string {
  const encVpa = encodeURIComponent(upiId.trim());
  const encName = encodeURIComponent(name.trim());
  const encNote = encodeURIComponent(note.trim());
  const amtStr = amount.toFixed(2);

  return `upi://pay?pa=${encVpa}&pn=${encName}&am=${amtStr}&cu=INR&tn=${encNote}`;
}

