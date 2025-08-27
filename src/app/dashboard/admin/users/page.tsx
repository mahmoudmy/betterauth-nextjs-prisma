"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { admin } from "@/lib/auth-client";
import CreateUserDialog from "@/components/admin/create-user-dialog";
import UserList from "@/components/admin/user-list";
import { DataPagination } from "@/components/ui/data-pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role?: string;
  banned?: boolean;
  createdAt: string;
}

type AdminListedUser = {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  role?: string;
  banned?: boolean;
  createdAt?: string;
};

type AdminListUsersResponse = {
  users: AdminListedUser[];
  total: number;
  limit?: number;
  offset?: number;
} | {
  users: never[];
  total: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [meta, setMeta] = useState<{ total?: number; limit?: number; offset?: number }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await admin.listUsers({
        query: {
          searchValue: search || undefined,
          searchField: search ? "name" : undefined,
          limit: pageSize,
          offset: (page - 1) * pageSize,
          ...(roleFilter
            ? { filterField: "role", filterValue: roleFilter, filterOperator: "eq" }
            : {}),
        },
      });
      const res = data as AdminListUsersResponse | undefined;
      const mapped = (res?.users || []).map((u) => ({
        id: u.id,
        name: u.name ?? "",
        email: u.email ?? undefined,
        username: u.username ?? undefined,
        role: u.role ?? undefined,
        banned: u.banned ?? false,
        createdAt: u.createdAt ?? new Date().toISOString(),
      }));
      setUsers(mapped as User[]);
      if (res && 'total' in res) {
        const withMeta = res as { total: number; limit?: number; offset?: number };
        setMeta({ total: withMeta.total, limit: withMeta.limit ?? pageSize, offset: withMeta.offset ?? (page - 1) * pageSize });
      } else {
        setMeta({});
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page, pageSize]);

  // Single useEffect to handle all data fetching
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, pageSize]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">مدیریت کاربران</h1>
          <p className="text-muted-foreground">مدیریت کاربران و سطح دسترسی</p>
        </div>
        <CreateUserDialog onCreated={fetchUsers} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>فیلترها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="جستجوی کاربران..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={roleFilter || "all"} onValueChange={(v) => setRoleFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="فیلتر بر اساس نقش" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه نقش‌ها</SelectItem>
                <SelectItem value="user">کاربر</SelectItem>
                <SelectItem value="admin">مدیر سیستم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>کاربران</CardTitle>
          <CardDescription>
            {users.length} کاربر یافت شد{meta.total !== undefined ? ` / مجموع: ${meta.total}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserList
            users={users}
            onEdit={(user) => {
              console.log(user);
            }}
          />

          {/* Pagination Controls */}
          {meta.total && meta.total > pageSize && (
            <DataPagination
              total={meta.total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
