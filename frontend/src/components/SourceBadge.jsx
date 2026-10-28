import React from 'react';
import { Radio, Database, HardDrive } from 'lucide-react';
import { Badge } from './ui/badge';

export const SourceBadge = ({ source, size = 'normal' }) => {
  if (source === 'live_api') {
    return (
      <Badge variant="default" className={size === 'small' ? 'px-2 py-0.5 text-[10px]' : ''}>
        <Radio className="w-3 h-3 text-white" />
        Live Stream
      </Badge>
    );
  }

  if (source === 'mongodb_cache') {
    return (
      <Badge variant="secondary" className={size === 'small' ? 'px-2 py-0.5 text-[10px]' : ''}>
        <Database className="w-3 h-3 text-zinc-700" />
        Cached (MongoDB)
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={size === 'small' ? 'px-2 py-0.5 text-[10px]' : ''}>
      <HardDrive className="w-3 h-3 text-zinc-500" />
      Offline Dataset
    </Badge>
  );
};
