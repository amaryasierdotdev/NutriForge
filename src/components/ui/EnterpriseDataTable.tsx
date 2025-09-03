import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'

interface Column<T> {
  key: keyof T
  title: string
  width?: string
  sortable?: boolean
  render?: (value: any, record: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

interface Props<T> {
  data: T[]
  columns: Column<T>[]
  isDarkMode: boolean
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  selection?: {
    selectedRowKeys: string[]
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void
    getCheckboxProps?: (record: T) => { disabled?: boolean }
  }
  onRow?: (record: T, index: number) => {
    onClick?: () => void
    onDoubleClick?: () => void
  }
  emptyText?: string
  size?: 'small' | 'middle' | 'large'
}

const TableContainer = styled.div<{ isDarkMode: boolean }>`
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  border: 1px solid ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.08)'};
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(24px);
  box-shadow: ${props =>
    props.isDarkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.2)'
      : '0 8px 32px rgba(15, 23, 42, 0.08)'};
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const TableHeader = styled.thead<{ isDarkMode: boolean }>`
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(90deg, rgba(51, 65, 85, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)'
      : 'linear-gradient(90deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.95) 100%)'};
  border-bottom: 2px solid ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.08)'};
`

const TableHeaderCell = styled.th<{
  isDarkMode: boolean
  sortable: boolean
  align: string
  width?: string
}>`
  padding: 16px 20px;
  text-align: ${props => props.align};
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#cbd5e1' : '#475569'};
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  user-select: none;
  transition: all 0.2s ease;
  position: relative;
  width: ${props => props.width || 'auto'};

  ${props => props.sortable && `
    &:hover {
      background: ${props.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.05)'};
      color: ${props.isDarkMode ? '#f1f5f9' : '#334155'};
    }
  `}

  .sort-icon {
    margin-left: 8px;
    opacity: 0.5;
    transition: opacity 0.2s ease;
  }

  &:hover .sort-icon {
    opacity: 1;
  }
`

const TableBody = styled.tbody<{ isDarkMode: boolean }>`
  background: ${props =>
    props.isDarkMode
      ? 'rgba(15, 23, 42, 0.3)'
      : 'rgba(255, 255, 255, 0.5)'};
`

const TableRow = styled(motion.tr)<{
  isDarkMode: boolean
  clickable: boolean
  selected: boolean
}>`
  border-bottom: 1px solid ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.05)' : 'rgba(15, 23, 42, 0.05)'};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;

  ${props => props.selected && `
    background: ${props.isDarkMode
      ? 'rgba(59, 130, 246, 0.1)'
      : 'rgba(59, 130, 246, 0.05)'} !important;
    border-color: ${props.isDarkMode
      ? 'rgba(59, 130, 246, 0.2)'
      : 'rgba(59, 130, 246, 0.1)'};
  `}

  &:hover {
    background: ${props =>
      props.isDarkMode
        ? 'rgba(148, 163, 184, 0.05)'
        : 'rgba(15, 23, 42, 0.02)'};
  }

  &:last-child {
    border-bottom: none;
  }
`

const TableCell = styled.td<{
  isDarkMode: boolean
  align: string
  size: string
}>`
  padding: ${props => {
    switch (props.size) {
      case 'small': return '8px 16px'
      case 'large': return '20px 24px'
      default: return '12px 20px'
    }
  }};
  text-align: ${props => props.align};
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#334155'};
  vertical-align: middle;
`

const Checkbox = styled.input<{ isDarkMode: boolean }>`
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
  cursor: pointer;
`

const EmptyState = styled.div<{ isDarkMode: boolean }>`
  padding: 60px 20px;
  text-align: center;
  color: ${props => props.isDarkMode ? '#64748b' : '#94a3b8'};

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 16px;
    font-weight: 500;
  }
`

const LoadingOverlay = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props =>
    props.isDarkMode
      ? 'rgba(15, 23, 42, 0.8)'
      : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`

const Pagination = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.08)'};
  background: ${props =>
    props.isDarkMode
      ? 'rgba(30, 41, 59, 0.5)'
      : 'rgba(248, 250, 252, 0.5)'};
`

const PaginationInfo = styled.div<{ isDarkMode: boolean }>`
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
`

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const PaginationButton = styled.button<{
  isDarkMode: boolean
  active?: boolean
  disabled?: boolean
}>`
  padding: 8px 12px;
  border: 1px solid ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.1)'};
  border-radius: 6px;
  background: ${props =>
    props.active
      ? '#3b82f6'
      : props.isDarkMode
        ? 'rgba(30, 41, 59, 0.8)'
        : 'rgba(255, 255, 255, 0.9)'};
  color: ${props =>
    props.active
      ? 'white'
      : props.isDarkMode
        ? '#cbd5e1'
        : '#475569'};
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props =>
      props.active
        ? '#2563eb'
        : props.isDarkMode
          ? 'rgba(148, 163, 184, 0.1)'
          : 'rgba(15, 23, 42, 0.05)'};
  }
`

export function EnterpriseDataTable<T extends Record<string, any>>({
  data,
  columns,
  isDarkMode,
  loading = false,
  pagination,
  selection,
  onRow,
  emptyText = 'No data available',
  size = 'middle'
}: Props<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T
    direction: 'asc' | 'desc'
  } | null>(null)

  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig])

  const handleSort = (key: keyof T) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (!selection) return

    if (checked) {
      const allKeys = data.map((_, index) => index.toString())
      selection.onChange(allKeys, data)
    } else {
      selection.onChange([], [])
    }
  }

  const handleSelectRow = (key: string, record: T, checked: boolean) => {
    if (!selection) return

    const newSelectedKeys = checked
      ? [...selection.selectedRowKeys, key]
      : selection.selectedRowKeys.filter(k => k !== key)

    const newSelectedRows = data.filter((_, index) =>
      newSelectedKeys.includes(index.toString())
    )

    selection.onChange(newSelectedKeys, newSelectedRows)
  }

  const renderPagination = () => {
    if (!pagination) return null

    const { current, pageSize, total, onChange } = pagination
    const totalPages = Math.ceil(total / pageSize)
    const startItem = (current - 1) * pageSize + 1
    const endItem = Math.min(current * pageSize, total)

    return (
      <Pagination isDarkMode={isDarkMode}>
        <PaginationInfo isDarkMode={isDarkMode}>
          Showing {startItem}-{endItem} of {total} items
        </PaginationInfo>
        <PaginationControls>
          <PaginationButton
            isDarkMode={isDarkMode}
            disabled={current === 1}
            onClick={() => onChange(current - 1, pageSize)}
          >
            Previous
          </PaginationButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => 
              page === 1 || 
              page === totalPages || 
              Math.abs(page - current) <= 1
            )
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span style={{ padding: '0 8px', color: '#64748b' }}>...</span>
                )}
                <PaginationButton
                  isDarkMode={isDarkMode}
                  active={page === current}
                  onClick={() => onChange(page, pageSize)}
                >
                  {page}
                </PaginationButton>
              </React.Fragment>
            ))}
          <PaginationButton
            isDarkMode={isDarkMode}
            disabled={current === totalPages}
            onClick={() => onChange(current + 1, pageSize)}
          >
            Next
          </PaginationButton>
        </PaginationControls>
      </Pagination>
    )
  }

  return (
    <TableContainer isDarkMode={isDarkMode} style={{ position: 'relative' }}>
      <Table>
        <TableHeader isDarkMode={isDarkMode}>
          <tr>
            {selection && (
              <TableHeaderCell
                isDarkMode={isDarkMode}
                sortable={false}
                align="center"
                width="50px"
              >
                <Checkbox
                  isDarkMode={isDarkMode}
                  type="checkbox"
                  checked={selection.selectedRowKeys.length === data.length && data.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHeaderCell>
            )}
            {columns.map(column => (
              <TableHeaderCell
                key={String(column.key)}
                isDarkMode={isDarkMode}
                sortable={column.sortable || false}
                align={column.align || 'left'}
                width={column.width}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                {column.title}
                {column.sortable && (
                  <span className="sort-icon">
                    {sortConfig?.key === column.key
                      ? sortConfig.direction === 'asc' ? '↑' : '↓'
                      : '↕'}
                  </span>
                )}
              </TableHeaderCell>
            ))}
          </tr>
        </TableHeader>
        <TableBody isDarkMode={isDarkMode}>
          <AnimatePresence>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selection ? 1 : 0)}>
                  <EmptyState isDarkMode={isDarkMode}>
                    <div className="empty-icon">📊</div>
                    <div className="empty-text">{emptyText}</div>
                  </EmptyState>
                </td>
              </tr>
            ) : (
              sortedData.map((record, index) => {
                const rowKey = index.toString()
                const isSelected = selection?.selectedRowKeys.includes(rowKey) || false
                const rowProps = onRow?.(record, index) || {}

                return (
                  <TableRow
                    key={rowKey}
                    isDarkMode={isDarkMode}
                    clickable={!!rowProps.onClick}
                    selected={isSelected}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={rowProps.onClick}
                    onDoubleClick={rowProps.onDoubleClick}
                  >
                    {selection && (
                      <TableCell isDarkMode={isDarkMode} align="center" size={size}>
                        <Checkbox
                          isDarkMode={isDarkMode}
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(rowKey, record, e.target.checked)}
                          {...(selection.getCheckboxProps?.(record) || {})}
                        />
                      </TableCell>
                    )}
                    {columns.map(column => (
                      <TableCell
                        key={String(column.key)}
                        isDarkMode={isDarkMode}
                        align={column.align || 'left'}
                        size={size}
                      >
                        {column.render
                          ? column.render(record[column.key], record, index)
                          : String(record[column.key] || '')}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </AnimatePresence>
        </TableBody>
      </Table>

      {renderPagination()}

      {loading && (
        <LoadingOverlay isDarkMode={isDarkMode}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(148, 163, 184, 0.2)',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </LoadingOverlay>
      )}
    </TableContainer>
  )
}