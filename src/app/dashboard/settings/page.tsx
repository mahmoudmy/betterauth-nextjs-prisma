 "use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings as SettingsIcon } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        username: session.user.username || "",
      });
    }
  }, [session]);

  const handleSaveProfile = async () => {
    // In a real app, this would update the user profile
    console.log("Saving profile:", formData);
  };

  if (!session?.user) {
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
          <h1 className="text-3xl font-bold">تنظیمات</h1>
          <p className="text-muted-foreground">مدیریت تنظیمات حساب کاربری</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-reverse space-x-2">
              <User className="h-5 w-5" />
              <span>تنظیمات پروفایل</span>
            </CardTitle>
            <CardDescription>
              به‌روزرسانی اطلاعات شخصی
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback>
                  {session.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{session.user.name}</h3>
                <p className="text-sm text-muted-foreground">@{session.user.username}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">نام و نام خانوادگی</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="username">نام کاربری</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile}>
              ذخیره تغییرات
            </Button>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-reverse space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>اطلاعات حساب</span>
            </CardTitle>
            <CardDescription>
              مشاهده جزئیات حساب کاربری
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">شناسه کاربر</span>
                <span className="text-sm text-muted-foreground">{session.user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">نقش</span>
                <span className="text-sm text-muted-foreground">{session.user.role || "کاربر"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">تایید ایمیل</span>
                <span className="text-sm text-muted-foreground">
                  {session.user.emailVerified ? "بله" : "خیر"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">وضعیت حساب</span>
                <span className="text-sm text-muted-foreground">
                  {session.user.banned ? "مسدود" : "فعال"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}