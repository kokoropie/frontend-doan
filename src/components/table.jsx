import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Table as TableBase, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowDownAZ, ArrowDownZA, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Checkbox } from "./ui/checkbox";
import { cn } from "@/lib/utils";

export default function Table({ data, columns, className = '', tableClassName = '', page = 1, limit = 15, hideDisabled = false, isSelectingRow = false, columnPining = {}, paginationDisabled = false }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: page - 1,
    pageSize: limit,
  });
  const [_columnPinning, setColumnPinning] = useState(columnPining);
  const [_columns, setColumns] = useState(columns);
  const table = useReactTable({
    data, columns: _columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onColumnPinningChange: setColumnPinning,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      columnPinning: _columnPinning,
    }
  });

  const getCommonPinningStyles = (column) => {
    const isPinned = column.getIsPinned()
    const isLastLeftPinnedColumn =
      isPinned === 'left' && column.getIsLastColumn('left')
    const isFirstRightPinnedColumn =
      isPinned === 'right' && column.getIsFirstColumn('right')

    return {
      className: cn({
        'bg-white group-[data-state=selected]:bg-muted': isPinned,
        'shadow-[-1px_0_1px_-1px_gray_inset]': isLastLeftPinnedColumn,
        'shadow-[1px_0_1px_-1px_gray_inset]': isFirstRightPinnedColumn,
        'sticky': isPinned,
        'z-10': isPinned,
      }),
      style: {
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
      }
    };
  }

  useEffect(() => {
    const index = columns.findIndex((column) => column.id === 'select');
    if (isSelectingRow) {
      if (index === -1) {
        setColumns([
          {
            id: "select",
            header: ({ table }) => {
              return (
                <Checkbox
                  checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                  }
                  onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                  aria-label="Select all"
                />
              )
            },
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          }, ...columns])
      }
    } else {
      const newColumns = [...columns];
      if (index !== -1) {
        newColumns.splice(index, 1);
      }
      setColumns(newColumns);
    }
  }, [isSelectingRow, columns])

  useEffect(() => {
    table.getAllColumns().forEach((column) => {
      column.toggleVisibility(!column.columnDef.hidden)
    })
  }, [_columns])

  return (
    <div className={className}>
      <div className={tableClassName}>
        <TableBase>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return !header.column.columnDef.hidden && (
                    <TableHead key={header.id} onClick={() => {
                        if (header.column.getCanSort()) {
                          header.column.toggleSorting(undefined, true)
                        }
                      }} {...getCommonPinningStyles(header.column)}>
                      <div className="inline-flex items-center w-full">
                        <div className="w-full">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                        {header.column.getCanSort() && <>
                          {header.column.getIsSorted() === "asc" && <ArrowDownAZ className="ml-2 h-4 w-4" />}
                          {header.column.getIsSorted() === "desc" && <ArrowDownZA className="ml-2 h-4 w-4" />}
                          {header.column.getIsSorted() != "asc" && header.column.getIsSorted() != "desc" && <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />}
                        </>}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} onClick={(e) => {
                      if (isSelectingRow) {
                        if (cell.column.id === 'actions') return;
                        e.stopPropagation();
                        cell.row.toggleSelected(!cell.row.getIsSelected())
                      }
                    }} {...getCommonPinningStyles(cell.column)}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">Không có dữ liệu.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableBase>
      </div>
      {data.length && !paginationDisabled ? <div className="flex items-center justify-between space-x-2 py-4">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-12 font-normal">
                <span>{pagination.pageSize}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[10, 15, 20, 50, 100].map((pageSize) => (
                <DropdownMenuItem key={pageSize} onClick={() => {
                  table.setPageSize(pageSize);
                  table.setPageIndex(0);
                }}>
                  {pageSize}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-x-2">
          {(!hideDisabled || (hideDisabled && table.getCanPreviousPage())) && <>
            <Button variant="outline" size="sm" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronsLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft />
            </Button>
          </>}
          {(!hideDisabled || (hideDisabled && table.getCanNextPage())) && <>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight />
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>
              <ChevronsRight />
            </Button>
          </>}
        </div>
        {isSelectingRow && <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} /{" "}
          {table.getFilteredRowModel().rows.length} dữ liệu được chọn.
        </div>}
      </div> : null}
    </div>
  );
}