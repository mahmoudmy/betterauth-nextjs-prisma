"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Ban, Unlock, Key, Shield } from "lucide-react";
import { useState } from "react";
import BanUserDialog from "./ban-user-dialog";
import ResetPasswordDialog from "./reset-password-dialog";
import ChangeRoleDialog from "./change-role-dialog";

interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role?: string;
  banned?: boolean;
  createdAt: string;
}

interface UserActionsDropdownProps {
  user: User;
  onEdit?: (user: User) => void;
  onAction?: () => void;
}

export default function UserActionsDropdown({ user, onEdit, onAction }: UserActionsDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  
  const isBanned = user.banned;

  const handleAction = () => {
    onAction?.();
    setShowBanDialog(false);
    setShowPasswordDialog(false);
    setShowRoleDialog(false);
    // Reset dropdown state after action
    setDropdownOpen(false);
  };

  const handleDropdownOpenChange = (open: boolean) => {
    setDropdownOpen(open);
    // If dropdown is closing and no dialogs are open, reset all states
    if (!open && !showBanDialog && !showPasswordDialog && !showRoleDialog) {
      setShowBanDialog(false);
      setShowPasswordDialog(false);
      setShowRoleDialog(false);
    }
  };

  const openDialog = (dialogType: 'ban' | 'password' | 'role') => {
    // Close dropdown when opening dialog
    setDropdownOpen(false);
    
    switch (dialogType) {
      case 'ban':
        setShowBanDialog(true);
        break;
      case 'password':
        setShowPasswordDialog(true);
        break;
      case 'role':
        setShowRoleDialog(true);
        break;
    }
  };

  return (
    <>
      <DropdownMenu dir="rtl" open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">باز کردن منو</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onEdit?.(user)}>
            <Edit className="mr-2 h-4 w-4" />
            ویرایش
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => openDialog('ban')}>
            {isBanned ? (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                باز کردن کاربر
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                مسدود کردن کاربر
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => openDialog('password')}>
            <Key className="mr-2 h-4 w-4" />
            تغییر رمز عبور
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => openDialog('role')}>
            <Shield className="mr-2 h-4 w-4" />
            تغییر نقش
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Render dialogs outside of dropdown menu */}
      {showBanDialog && (
        <BanUserDialog 
          user={user} 
          onAction={handleAction}
        />
      )}
      
      {showPasswordDialog && (
        <ResetPasswordDialog 
          user={user} 
          onAction={handleAction}
        />
      )}
      
      {showRoleDialog && (
        <ChangeRoleDialog 
          user={user} 
          onAction={handleAction}
        />
      )}
    </>
  );
}
