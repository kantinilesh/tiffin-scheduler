/**
 * Tabs.tsx — Tab navigation component.
 *
 * Renders a horizontal list of tabs with a bottom border (#E5E7EB)
 * and an amber (#D97706) active underline indicator.
 * Supports optional item counts/badges per tab.
 */

"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div className={`border-b border-[#e5e7eb] ${className}`}>
      <nav className="-mb-px flex gap-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`group inline-flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
                isActive
                  ? "border-[#d97706] text-[#1a1a1a]"
                  : "border-transparent text-[#6b7280] hover:border-gray-300 hover:text-[#1a1a1a]"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    isActive
                      ? "bg-amber-100 text-[#b45309]"
                      : "bg-gray-100 text-[#6b7280] group-hover:bg-gray-200"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default Tabs;
