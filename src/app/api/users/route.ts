import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const searchValue = searchParams.get("searchValue");
    const searchField = searchParams.get("searchField");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const filterField = searchParams.get("filterField");
    const filterValue = searchParams.get("filterValue");
    const filterOperator = searchParams.get("filterOperator") || "eq";

    // Build where clause
    const where: any = {};
    
    if (searchValue && searchField) {
      if (searchField === "name") {
        where.name = { contains: searchValue, mode: "insensitive" };
      } else if (searchField === "email") {
        where.email = { contains: searchValue, mode: "insensitive" };
      } else if (searchField === "username") {
        where.username = { contains: searchValue, mode: "insensitive" };
      }
    }

    if (filterField && filterValue) {
      if (filterOperator === "eq") {
        where[filterField] = filterValue;
      } else if (filterOperator === "contains") {
        where[filterField] = { contains: filterValue, mode: "insensitive" };
      }
    }

    // Get users with department information
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    // Transform the data to match the expected format
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      departmentId: user.departmentId,
      department: user.department ? {
        id: user.department.id,
        name: user.department.name,
      } : null,
      emailVerified: user.emailVerified,
      image: user.image,
      displayUsername: user.displayUsername,
    }));

    return NextResponse.json({
      users: transformedUsers,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
