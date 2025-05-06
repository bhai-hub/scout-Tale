
'use server';

import { z } from 'zod';
import { contactFormSchema, type ContactFormData, type ContactMessageToInsert, type ContactMessage } from '@/schemas/contact';
import clientPromise from '@/lib/mongodb';
import type { ObjectId } from 'mongodb'; // Import ObjectId if you are dealing with it directly

interface ActionResult {
    success: boolean;
    message: string;
    errors?: z.ZodIssue[]; // Add errors for more detailed feedback
}

export async function submitContactForm(
    prevState: ActionResult | null,
    formData: FormData
): Promise<ActionResult> {

    const rawFormData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
    };

    const validatedFields = contactFormSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: `Invalid form data. Please check the fields.`,
            errors: validatedFields.error.issues,
        };
    }

    // Use ContactMessageToInsert for the data to be saved, as _id is auto-generated
    const dataToSave: ContactMessageToInsert = {
        ...validatedFields.data,
        createdAt: new Date(),
    };

    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection<ContactMessageToInsert>('contactMessages');

        const result = await collection.insertOne(dataToSave);

        if (result.acknowledged) {
            console.log('Contact message saved successfully:', result.insertedId);
            return { success: true, message: 'Your message has been sent successfully!' };
        } else {
            console.error('Failed to insert contact message into MongoDB');
            return { success: false, message: 'Failed to save message. Please try again.' };
        }

    } catch (error) {
        console.error('Database Error:', error);
        if (error instanceof z.ZodError) { // Handle Zod errors during insertion (less likely here)
            return { success: false, message: 'Data formatting error before save.', errors: error.issues };
        }
        return { success: false, message: 'Database error. Failed to send message.' };
    }
}


export async function getContactMessages(): Promise<ContactMessage[]> {
    try {
        const client = await clientPromise;
        const db = client.db();
        // Define the type for documents in the collection.
        // MongoDB stores _id as ObjectId, but we'll convert it to string.
        const collection = db.collection<{ _id: ObjectId } & Omit<ContactMessage, '_id' | 'createdAt'> & { createdAt: Date | string }>('contactMessages');
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
        // Instead of throwing, return an empty array or handle error as per application needs
        return [];
    }
}
