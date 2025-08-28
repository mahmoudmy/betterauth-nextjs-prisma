"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  newPassword: z.string().min(6, "حداقل ۶ کاراکتر"),
  confirmPassword: z.string().min(6, "حداقل ۶ کاراکتر"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "رمزهای عبور مطابقت ندارند",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

interface User {
  id: string;
  name: string;
  email?: string;
}

interface ResetPasswordDialogProps {
  user: User;
  onAction?: () => void;
}

export default function ResetPasswordDialog({ user, onAction }: ResetPasswordDialogProps) {
  const [open, setOpen] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsResetting(true);
      await admin.setUserPassword({
        userId: user.id,
        newPassword: values.newPassword,
      });

      handleClose();
      onAction?.();
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تغییر رمز عبور کاربر</DialogTitle>
          <DialogDescription>
            رمز عبور جدید برای کاربر &quot;{user.name}&quot; تنظیم کنید
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز عبور جدید</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="رمز عبور جدید را وارد کنید..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تأیید رمز عبور</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="رمز عبور را دوباره وارد کنید..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground">
              <p>⚠️ توجه: پس از تغییر رمز عبور، کاربر باید با رمز جدید وارد شود.</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isResetting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isResetting ? "در حال تغییر..." : "تغییر رمز عبور"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
