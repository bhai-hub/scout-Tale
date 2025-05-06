
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Inbox, RefreshCw } from 'lucide-react'; // Added RefreshCw
import type { ContactMessage } from '@/schemas/contact'; // Assuming ContactMessage type includes _id
import clientPromise from '@/lib/mongodb'; // Import clientPromise to fetch directly on client for simplicity in this example.
                                        // Ideally, use a server action for data fetching.

async function fetchContactMessages(): Promise<ContactMessage[]> {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection<Omit<ContactMessage, '_id'> & { _id: any }>('contactMessages'); // Use 'any' for _id initially
        const messages = await collection.find({}).sort({ createdAt: -1 }).toArray();

        // Map MongoDB documents to ContactMessage type
        return messages.map(msg => ({
            _id: msg._id.toString(), // Convert ObjectId to string
            name: msg.name,
            email: msg.email,
            subject: msg.subject,
            message: msg.message,
            createdAt: new Date(msg.createdAt), // Ensure createdAt is a Date object
        }));
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        throw new Error("Failed to fetch messages."); // Throw error to be caught by caller
    }
}


export default function AdminContactMessagesPage() {
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const fetchedMessages = await fetchContactMessages();
      setMessages(fetchedMessages);
    } catch (error) {
      toast({
        title: 'Error Fetching Messages',
        description: (error as Error).message || 'Could not load contact messages.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Please log in as an admin to view messages.',
        variant: 'destructive',
      });
      router.push('/admin/login');
    } else if (isAdmin) {
      loadMessages();
    }
  }, [isAdmin, isAuthLoading, router, toast]);


  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /> <p className="ml-2">Loading authentication...</p></div>;
  }
  if (!isAdmin && !isAuthLoading) {
    return <div className="flex justify-center items-center h-64"><p>Redirecting to login...</p></div>;
  }


  return (
    <div className="max-w-6xl mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Contact Form Messages</CardTitle>
            <CardDescription>View messages submitted through the contact form.</CardDescription>
          </div>
          <Button onClick={loadMessages} variant="outline" size="sm" disabled={isLoadingMessages}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingMessages ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Inbox className="mx-auto h-12 w-12 mb-4" />
              <p>No contact messages found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead className="w-[150px]">Name</TableHead>
                    <TableHead className="w-[200px]">Email</TableHead>
                    <TableHead className="w-[250px]">Subject</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((msg) => (
                    <TableRow key={msg._id}>
                      <TableCell>{new Date(msg.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{msg.name}</TableCell>
                      <TableCell>{msg.email}</TableCell>
                      <TableCell>{msg.subject}</TableCell>
                      <TableCell className="whitespace-pre-wrap break-words">{msg.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
