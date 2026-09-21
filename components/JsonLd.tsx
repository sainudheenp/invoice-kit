/** Renders one or more JSON-LD structured-data blocks. */
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
