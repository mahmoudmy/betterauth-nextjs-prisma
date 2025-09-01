"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { DataPagination } from "@/components/ui/data-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import DepartmentList from "@/components/admin/department-list";
import CreateDepartmentDialog from "@/components/admin/create-department-dialog";

interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  _count: {
    users: number;
  };
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState<{ total?: number; limit?: number; offset?: number }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/departments?page=${page}&limit=${pageSize}&search=${search}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }

      const data = await response.json();
      setDepartments(data.departments);
      setMeta({
        total: data.total,
        limit: data.limit,
        offset: data.offset,
      });
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  }, [search, page, pageSize]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

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
          <h1 className="text-3xl font-bold">مدیریت دپارتمان‌ها</h1>
          <p className="text-muted-foreground">مدیریت دپارتمان‌ها و سازمان‌دهی کاربران</p>
        </div>
        <CreateDepartmentDialog onCreated={fetchDepartments} />
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>جستجو</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="جستجو در دپارتمان‌ها..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Departments List */}
      <Card>
        <CardHeader>
          <CardTitle>دپارتمان‌ها</CardTitle>
          <CardDescription>
            {departments.length} دپارتمان یافت شد{meta.total !== undefined ? ` / مجموع: ${meta.total}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentList
            departments={departments}
            onAction={fetchDepartments}
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
