"use client";

import { useCallback, useState } from "react";

export interface EditingCell {
  columnId: string;
  rowId: string;
}

export function useCellEditing() {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [draftValue, setDraftValue] = useState("");

  const startEdit = useCallback((cell: EditingCell, initialValue: string) => {
    setEditingCell(cell);
    setDraftValue(initialValue);
  }, []);

  const cancel = useCallback(() => {
    setEditingCell(null);
    setDraftValue("");
  }, []);

  const isEditing = useCallback(
    (rowId: string, columnId: string) =>
      editingCell?.rowId === rowId && editingCell?.columnId === columnId,
    [editingCell]
  );

  return {
    editingCell,
    draftValue,
    setDraftValue,
    startEdit,
    cancel,
    isEditing,
  };
}
