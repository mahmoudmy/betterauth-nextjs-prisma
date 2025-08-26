"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit } from "lucide-react";

interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role?: string;
  banned?: boolean;
  createdAt: string;
}

interface UserListProps {
  users: User[];
  onEdit?: (user: User) => void;
}

export default function UserList({ users, onEdit }: UserListProps) {
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default" className="bg-red-100 text-red-800">مدیر</Badge>;
      case "manager":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">مدیر میانی</Badge>;
      case "user":
        return <Badge variant="secondary">کاربر</Badge>;
      default:
        return <Badge variant="outline">{role || "کاربر"}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>نام</TableHead>
            <TableHead>نام کاربری</TableHead>
            <TableHead>ایمیل</TableHead>
            <TableHead>نقش</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>تاریخ عضویت</TableHead>
            <TableHead className="text-right">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>@{user.username || "بدون نام کاربری"}</TableCell>
              <TableCell>{user.email || "بدون ایمیل"}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>
                {user.banned ? (
                  <Badge variant="destructive">مسدود</Badge>
                ) : (
                  <Badge variant="secondary">فعال</Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
