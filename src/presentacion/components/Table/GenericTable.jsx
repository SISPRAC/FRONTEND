import { useState, useMemo } from "react";
import { SquareArrowRight, SquareArrowLeft } from 'lucide-react';

export default function GenericTable({
  rows,
  columns,
  actions = [],
  emptyMessage = "No hay registros",
  pageSize = 6,
  currentPage,
  onPageChange,
}) {


  const totalPages = Math.ceil(rows.length / pageSize);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, currentPage, pageSize]);

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full">

          <thead>
            <tr className="border-b-2 border-slate-100">

              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3.5 text-[13px] font-bold text-slate-400 text-center"
                >
                  {column.label}
                </th>
              ))}

              {actions.length > 0 && (
                <th className="px-4 py-3.5 text-[13px] font-bold text-slate-400 text-center">
                  Acciones
                </th>
              )}

            </tr>
          </thead>

          <tbody>

            {paginatedRows.map((row, i) => (
              <tr
                key={row.id}
                className={[
                  "transition-colors duration-100 hover:bg-slate-50 text-center",
                  i < paginatedRows.length - 1
                    ? "border-b border-slate-100"
                    : "",
                ].join(" ")}
              >

                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={
                      column.primary
                        ? "px-4 py-3.5 text-sm text-slate-800 font-bold"
                        : "px-4 py-3.5 text-sm text-slate-500"
                    }
                  >
                    {column.render
                      ? column.render(row)
                      : row[column.key]}
                  </td>
                ))}

                {actions.length > 0 && (
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 justify-center">
                      {actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => action.onClick(row.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${action.className}`}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                )}

              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (actions.length ? 1 : 0)}
                  className="text-center py-10 text-slate-400 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

          </tbody>

        </table>
      </div>

      {rows.length > pageSize && (
        <div className="flex justify-end items-center gap-2 mt-3">

          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1 border rounded disabled:opacity-50"
          >
            <SquareArrowLeft size={16} />
          </button>

          <span className="text-xs text-slate-600">
            Página {currentPage} de {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1 border rounded disabled:opacity-50"
          >
            <SquareArrowRight size={16} />
          </button>

        </div>
      )}
    </>
  );
}