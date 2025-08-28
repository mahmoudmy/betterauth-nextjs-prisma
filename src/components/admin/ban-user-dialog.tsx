"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const banFormSchema = z.object({
  banReason: z.string().min(1, "دلیل مسدودیت الزامی است"),
  banExpiresIn: z.string().optional(),
});

const unbanFormSchema = z.object({});

type BanFormValues = z.infer<typeof banFormSchema>;
type UnbanFormValues = z.infer<typeof unbanFormSchema>;

interface User {
  id: string;
  name: string;
  email?: string;
  banned?: boolean;
}

interface BanUserDialogProps {
  user: User;
  onAction?: () => void;
}

export default function BanUserDialog({ user, onAction }: BanUserDialogProps) {
  const [open, setOpen] = useState(true);
  const [isBanning, setIsBanning] = useState(false);
  const [isUnbanning, setIsUnbanning] = useState(false);

  const banForm = useForm<BanFormValues>({
    resolver: zodResolver(banFormSchema),
    defaultValues: { banReason: "", banExpiresIn: "" },
  });

  const unbanForm = useForm<UnbanFormValues>({
    resolver: zodResolver(unbanFormSchema),
  });

  const handleClose = () => {
    setOpen(false);
    // Reset form when closing
    banForm.reset();
    unbanForm.reset();
  };

  const handleBan = async (values: BanFormValues) => {
    try {
      setIsBanning(true);
      const expiresIn = values.banExpiresIn 
        ? parseInt(values.banExpiresIn) * 24 * 60 * 60 // Convert days to seconds
        : undefined;
      
      await admin.banUser({
        userId: user.id,
        banReason: values.banReason,
        banExpiresIn: expiresIn,
      });
      
      handleClose();
      onAction?.();
    } catch (error) {
      console.error("Error banning user:", error);
    } finally {
      setIsBanning(false);
    }
  };

  const handleUnban = async () => {
    try {
      setIsUnbanning(true);
      await admin.unbanUser({
        userId: user.id,
      });
      
      handleClose();
      onAction?.();
    } catch (error) {
      console.error("Error unbanning user:", error);
    } finally {
      setIsUnbanning(false);
    }
  };

  const isBanned = user.banned;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isBanned ? "باز کردن کاربر" : "مسدود کردن کاربر"}
          </DialogTitle>
          <DialogDescription>
            {isBanned 
              ? `آیا می‌خواهید کاربر &quot;${user.name}&quot; را باز کنید؟`
              : `آیا می‌خواهید کاربر &quot;${user.name}&quot; را مسدود کنید؟`
            }
          </DialogDescription>
        </DialogHeader>
        
        {isBanned ? (
          <Form {...unbanForm}>
            <form className="space-y-4" onSubmit={unbanForm.handleSubmit(handleUnban)}>
              <div className="text-sm text-muted-foreground">
                این کاربر در حال حاضر مسدود است. با کلیک روی دکمه &quot;باز کردن&quot;، کاربر می‌تواند دوباره وارد سیستم شود.
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  انصراف
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUnbanning}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUnbanning ? "در حال باز کردن..." : "باز کردن کاربر"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...banForm}>
            <form className="space-y-4" onSubmit={banForm.handleSubmit(handleBan)}>
              <FormField
                control={banForm.control}
                name="banReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>دلیل مسدودیت</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="دلیل مسدود کردن کاربر را وارد کنید..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={banForm.control}
                name="banExpiresIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مدت مسدودیت (روز)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="خالی = مسدودیت دائمی"
                        min="1"
                        {...field} 
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground">
                      در صورت خالی گذاشتن، مسدودیت دائمی خواهد بود
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  انصراف
                </Button>
                <Button 
                  type="submit" 
                  disabled={isBanning}
                  variant="destructive"
                >
                  {isBanning ? "در حال مسدود کردن..." : "مسدود کردن کاربر"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
