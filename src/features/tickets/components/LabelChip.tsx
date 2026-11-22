import * as React from 'react';

/** Small colored pill with the label name. */
export default function LabelChip({
  name,
  color,
}: {
  name: string;
  color: string;
}) {
  return (
    <span className='inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-700 md:text-xs'>
      <span
        aria-hidden
        className='size-2 shrink-0 rounded-full'
        style={{ backgroundColor: color }}
      />
      <span className='truncate'>{name}</span>
    </span>
  );
}
