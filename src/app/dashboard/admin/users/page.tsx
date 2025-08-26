 "use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { admin } from "@/lib/auth-client";
import CreateUserDialog from "@/components/admin/create-user-dialog";
import UserList from "@/components/admin/user-list";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";

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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, pageSize]);



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
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
                <SelectItem value="manager">مدیر میانی</SelectItem>
                <SelectItem value="admin">مدیر</SelectItem>
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
            <div className="mt-6 space-y-4">
              {/* Page Size Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">نمایش</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">مورد در هر صفحه</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  نمایش {((page - 1) * pageSize) + 1} تا {Math.min(page * pageSize, meta.total)} از {meta.total} مورد
                </div>
              </div>

              {/* Pagination Navigation */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {/* First page */}
                  {page > 3 && (
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(1);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis after first page */}
                  {page > 4 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {/* Previous page */}
                  {page > 2 && (
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(page - 1);
                        }}
                      >
                        {page - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Current page */}
                  <PaginationItem>
                    <PaginationLink 
                      href="#" 
                      isActive
                      onClick={(e) => e.preventDefault()}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                  
                  {/* Next page */}
                  {page < Math.ceil((meta.total || 0) / pageSize) - 1 && (
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(page + 1);
                        }}
                      >
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis before last page */}
                  {page < Math.ceil((meta.total || 0) / pageSize) - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {/* Last page */}
                  {page < Math.ceil((meta.total || 0) / pageSize) - 2 && (
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(Math.ceil((meta.total || 0) / pageSize));
                        }}
                      >
                        {Math.ceil((meta.total || 0) / pageSize)}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < Math.ceil((meta.total || 0) / pageSize)) setPage(page + 1);
                      }}
                      className={page >= Math.ceil((meta.total || 0) / pageSize) ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}