"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import EditDepartmentDialog from "./edit-department-dialog";

interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  _count: {
    users: number;
  };
}

interface DepartmentListProps {
  departments: Department[];
  onAction: () => void;
}

export default function DepartmentList({ departments, onAction }: DepartmentListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);

  const handleDelete = async () => {
    if (!departmentToDelete) return;

    try {
      const response = await fetch(`/api/departments/${departmentToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete department");
      }

      onAction();
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("خطا در حذف دپارتمان");
    }
  };

  const openDeleteDialog = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (department: Department) => {
    setDepartmentToEdit(department);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setDepartmentToEdit(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>نام دپارتمان</TableHead>
            <TableHead>توضیحات</TableHead>
            <TableHead>تعداد کاربران</TableHead>
            <TableHead>تاریخ ایجاد</TableHead>
            <TableHead className="text-right">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell className="font-medium">{department.name}</TableCell>
              <TableCell>
                {department.description ? (
                  <span className="text-muted-foreground">{department.description}</span>
                ) : (
                  <span className="text-muted-foreground italic">بدون توضیحات</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {department._count.users}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(department.createdAt)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">باز کردن منو</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(department)}>
                      <Edit className="mr-2 h-4 w-4" />
                      ویرایش
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(department)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف دپارتمان</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید دپارتمان &quot;{departmentToDelete?.name}&quot; را حذف کنید؟
              {departmentToDelete?._count?.users && departmentToDelete._count.users > 0 && (
                <span className="block mt-2 text-red-600">
                  این دپارتمان {departmentToDelete._count.users} کاربر دارد و قابل حذف نیست.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={departmentToDelete?._count?.users ? departmentToDelete._count.users > 0 : false}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {editDialogOpen && departmentToEdit && (
        <EditDepartmentDialog
          department={departmentToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onUpdated={() => {
            closeEditDialog();
            onAction();
          }}
        />
      )}
    </>
  );
}
