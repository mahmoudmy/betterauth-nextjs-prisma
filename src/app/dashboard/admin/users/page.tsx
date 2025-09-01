"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  banReason?: string | null;
  banExpires?: string | null;
  createdAt: string;
  updatedAt: string;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  emailVerified?: boolean;
  image?: string | null;
  displayUsername?: string | null;
}

type AdminListedUser = {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  role?: string;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: string | null;
  createdAt?: string;
  updatedAt?: string;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  emailVerified?: boolean;
  image?: string | null;
  displayUsername?: string | null;
};

type AdminListUsersResponse = {
  users: AdminListedUser[];
  total: number;
  limit: number;
  offset: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [meta, setMeta] = useState<{ total?: number; limit?: number; offset?: number }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.append("searchValue", debouncedSearch);
        params.append("searchField", "name");
      }
      if (roleFilter) {
        params.append("filterField", "role");
        params.append("filterValue", roleFilter);
        params.append("filterOperator", "eq");
      }
      params.append("limit", pageSize.toString());
      params.append("offset", ((page - 1) * pageSize).toString());

      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      const res = data as AdminListUsersResponse;
      
      const mapped = (res?.users || []).map((u) => ({
        id: u.id,
        name: u.name ?? "",
        email: u.email ?? undefined,
        username: u.username ?? undefined,
        role: u.role ?? undefined,
        banned: u.banned ?? false,
        banReason: u.banReason ?? null,
        banExpires: u.banExpires ?? null,
        createdAt: u.createdAt ?? new Date().toISOString(),
        updatedAt: u.updatedAt ?? new Date().toISOString(),
        departmentId: u.departmentId ?? null,
        department: u.department,
        emailVerified: u.emailVerified ?? false,
        image: u.image ?? null,
        displayUsername: u.displayUsername ?? null,
      }));
      
      setUsers(mapped as User[]);
      setMeta({ 
        total: res.total, 
        limit: res.limit ?? pageSize, 
        offset: res.offset ?? (page - 1) * pageSize 
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, page, pageSize]);

  // Single useEffect to handle all data fetching
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, pageSize]);

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
            onAction={fetchUsers}
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
