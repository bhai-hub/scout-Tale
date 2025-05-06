
'use server';

import { z } from 'zod';
import { contactFormSchema, type ContactFormData, type ContactMessage } from '@/schemas/contact';
import clientPromise from '@/lib/mongodb';

interface ActionResult {
    success: boolean;
    message: string;
}

export async function submitContactForm(
    prevState: ActionResult | null, // Required for useFormState
    formData: FormData
): Promise<ActionResult> {

    // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 1000));

    const rawFormData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
    };

    // Validate form data using Zod
    const validatedFields = contactFormSchema.safeParse(rawFormData);

    // If form validation fails, return errors
    if (!validatedFields.success) {
        // Aggregate error messages (optional, could return full error object)
        const errorMessages = validatedFields.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        console.error('Validation Error:', validatedFields.error.flatten());
        return {
            success: false,
            message: `Invalid form data. Errors: ${errorMessages}`,
            // errors: validatedFields.error.flatten().fieldErrors, // Or return structured errors
        };
    }

    const dataToSave: Omit<ContactMessage, '_id'> = {
        ...validatedFields.data,
        createdAt: new Date(),
    };

    try {
        const client = await clientPromise;
        const db = client.db(); // Use default DB from connection string or specify one: client.db("yourDbName")
        const collection = db.collection<Omit<ContactMessage, '_id'>>('contactMessages'); // Specify collection and type

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
        return { success: false, message: 'Database error. Failed to send message.' };
    }
}
