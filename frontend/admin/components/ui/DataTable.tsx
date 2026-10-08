import React from 'react';
import { DataTableProps } from '../../types/ui';
import { colors, typography, radii, transitions } from '../../tokens';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found in this administrative dataset.',
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: colors.cardSurface,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          padding: '2rem',
        }}
      >
        <LoadingState message="Fetching table rows..." />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        style={{
          backgroundColor: colors.cardSurface,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          padding: '1.5rem',
        }}
      >
        <EmptyState title="No Records" description={emptyMessage} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        backgroundColor: colors.cardSurface,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.lg,
        fontFamily: typography.fontFamily,
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: typography.fontSize.sm,
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: colors.adminBackground,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.deepForestGreen,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  width: col.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const key = keyExtractor(row);
            const isEven = index % 2 === 0;

            return (
              <tr
                key={key}
                style={{
                  borderBottom: `1px solid ${colors.border}`,
                  backgroundColor: isEven ? colors.cardSurface : '#FAFCFB',
                  transition: `background-color ${transitions.fast}`,
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '0.875rem 1rem',
                      color: colors.primaryText,
                      verticalAlign: 'middle',
                    }}
                  >
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
