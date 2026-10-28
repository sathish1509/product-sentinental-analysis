import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

export const Tabs = ({ defaultValue, value, onValueChange, className = '', children, ...props }) => {
  const [selectedTab, setSelectedTab] = useState(defaultValue);
  const currentTab = value !== undefined ? value : selectedTab;

  const handleSelect = (val) => {
    if (onValueChange) onValueChange(val);
    else setSelectedTab(val);
  };

  return (
    <TabsContext.Provider value={{ currentTab, handleSelect }}>
      <div className={`space-y-4 ${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className = '', children, ...props }) => (
  <div
    className={`inline-flex h-9 items-center justify-center rounded-lg bg-zinc-100 p-1 text-zinc-600 border border-zinc-200/80 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const TabsTrigger = ({ value, className = '', children, ...props }) => {
  const { currentTab, handleSelect } = useContext(TabsContext);
  const isActive = currentTab === value;

  return (
    <button
      type="button"
      onClick={() => handleSelect(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
        isActive
          ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80'
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, className = '', children, ...props }) => {
  const { currentTab } = useContext(TabsContext);
  if (currentTab !== value) return null;

  return (
    <div className={`ring-offset-background focus-visible:outline-none ${className}`} {...props}>
      {children}
    </div>
  );
};
