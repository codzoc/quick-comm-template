/**
 * Order ID Generator
 * Generates human-readable order IDs in format: ORD-YYYYMMDD-XXXX
 * Example: ORD-20251118-A3F7
 */

export function generateOrderId() {
  // Get current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  // Generate random alphanumeric code (4 characters)
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters (0, O, I, 1)
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Combine: ORD-YYYYMMDD-XXXX
  return `ORD-${datePart}-${randomPart}`;
}

export default generateOrderId;
