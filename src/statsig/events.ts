/**
 * The client documents event metadata as string values, so booleans become
 * "true" and "false". Every contract property is kept, including event_id.
 */
export function metadataFor(properties: object): Record<string, string> {
  const metadata: Record<string, string> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'string') metadata[key] = value;
    else if (typeof value === 'boolean') metadata[key] = value ? 'true' : 'false';
  }
  return metadata;
}
