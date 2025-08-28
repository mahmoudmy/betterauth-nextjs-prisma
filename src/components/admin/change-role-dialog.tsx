"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { admin } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  role: z.enum(["user", "admin"], {
    message: "لطفاً یک نقش انتخاب کنید",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

interface ChangeRoleDialogProps {
  user: User;
  onAction?: () => void;
}

export default function ChangeRoleDialog({ user, onAction }: ChangeRoleDialogProps) {
  const [open, setOpen] = useState(true);
  const [isChanging, setIsChanging] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { role: (user.role as "user" | "admin") || "user" },
  });

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsChanging(true);
      await admin.setRole({
        userId: user.id,
        role: values.role,
      });

      handleClose();
      onAction?.();
    } catch (error) {
      console.error("Error changing role:", error);
    } finally {
      setIsChanging(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "مدیر سیستم";
      case "user":
        return "کاربر";
      default:
        return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تغییر نقش کاربر</DialogTitle>
          <DialogDescription>
            نقش کاربر &quot;{user.name}&quot; را تغییر دهید
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="text-sm text-muted-foreground">
              نقش فعلی: <span className="font-medium">{getRoleLabel(user.role || "user")}</span>
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نقش جدید</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب نقش" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div>
                            <span className="font-medium">کاربر: {' ' }</span>
                            <span className="text-sm text-muted-foreground">
                              دسترسی محدود به بخش‌های عمومی
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div>
                            <span className="font-medium">مدیر سیستم: {' ' }</span>
                            <span className="text-sm text-muted-foreground">
                              دسترسی کامل به تمام بخش‌های سیستم
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground">
              <p>⚠️ توجه: تغییر نقش کاربر بر دسترسی‌های وی تأثیر مستقیم دارد.</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isChanging}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isChanging ? "در حال تغییر..." : "تغییر نقش"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
