'use client';

import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { Plus } from 'lucide-react';

const Menu: React.FC = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-end p-4">
        <Button variant="outline" disabled>Loading...</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-end p-4">
        <Button asChild>
          <Link href="/api/auth/login" prefetch={false}>Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4">
      <Link href="/" className="text-2xl font-bold">Mindthred</Link>
      
      <div className="flex items-center space-x-4">
        <Button asChild variant="outline">
          <Link href="/create-set" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" /> Create
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src={user.picture || ''} alt={user.name || 'User'} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>
              <div className="font-normal">
                <div>{user.name}</div>
                <div className="text-muted-foreground text-xs">{user.email}</div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/${user.nickname}`}>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/api/auth/logout">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Menu;