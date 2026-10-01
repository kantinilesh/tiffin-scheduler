/**
 * Table.tsx — Clean table components for lists (emails, logs, senders).
 *
 * Implements Table, TableHeader, TableBody, TableRow, TableHead, and TableCell.
 * Styled with white background, #E5E7EB borders, and subtle row hover highlights.
 */

import React from "react";

export function Table({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
      <table className={`w-full text-left border-collapse text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <thead className={`border-b border-[#e5e7eb] bg-gray-50/80 text-xs font-medium uppercase tracking-wider text-[#6b7280] ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tbody className={`divide-y divide-[#e5e7eb] bg-white ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors duration-100 hover:bg-gray-50/60 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th scope="col" className={`px-4 py-3 text-left font-medium ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = "",
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3.5 text-sm text-[#1a1a1a] ${className}`}
    >
      {children}
    </td>
  );
}

export default Table;
