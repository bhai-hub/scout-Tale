
'use server';

import { z } from 'zod';
import { contactFormSchema, type ContactFormData, type ContactMessageToInsert } from '@/schemas/contact';
import clientPromise from '@/lib/mongodb';

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
