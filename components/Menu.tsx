'use client';

import React, { useEffect } from 'react';
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

  useEffect(() => {
    const addUserToDatabase = async () => {
      if (!user) return;

      try {
        const response = await fetch('http://localhost:8080/api/users', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nickname: user.nickname,
          })
        });

        if (!response.ok) {
          throw new Error('Failed to add user');
        }

        const data = await response.json()
        console.log(data.message)
      } catch (error) {
        console.log('User already added:');
      }
    };

    addUserToDatabase();
  }, [user]);

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
          <Link href="/api/auth/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4">
      <Link href="/" className="text-2xl font-bold">NodeBook</Link>
      
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
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/flashcards">My Flashcards</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/mindmaps">My Mind Maps</Link>
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