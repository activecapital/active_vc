async function sha256(message: string): Promise<string> {
  // Encode the message as a Uint8Array (required for Web Crypto API)
  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(message);

  // Hash the data
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert the hash to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hexHash;
}

export { sha256 };