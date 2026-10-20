export const PLATFORMS = ['ios', 'android'];

/**
 * Liquid glass is Frontline's surface treatment on every device; the detected
 * platform tunes the palette, corner radius and type. A `?platform=android|ios`
 * query param lets either flavour be previewed on any device.
 */
export function detectPlatform() {
  if (typeof window === 'undefined') return 'ios';
  const override = new URLSearchParams(window.location.search).get('platform');
  if (PLATFORMS.includes(override)) return override;
  const ua = navigator.userAgent || '';
  if (/Android/i.test(ua)) return 'android';
  return 'ios';
}