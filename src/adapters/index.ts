import type { BookingAdapter } from './base';
import { customAdapter } from './custom';

/** Return a booking adapter by provider name. */
export function getAdapter(name: string, conf: any): BookingAdapter {
  switch (name) {
    case 'custom':
      return customAdapter(conf);
    // Add vendor adapters later:
    // case 'opentable': return opentableAdapter(conf);
    default:
      return customAdapter(conf);
  }
}
