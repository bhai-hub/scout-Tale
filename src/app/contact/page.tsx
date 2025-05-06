
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { contactFormSchema, type ContactFormData } from '@/schemas/contact';
import { submitContactForm } from '@/actions/contact';
import { Send, Loader2 } from 'lucide-react';

const initialState = {
    success: false,
    message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
            ) : (
                <>
                   <Send className="mr-2 h-4 w-4" /> Send Message
                </>
            )}
        </Button>
    );
}


export default function ContactPage() {
    const [state, formAction] = useFormState(submitContactForm, initialState);
    const { toast } = useToast();

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
        // Use the result from useFormState to manage errors
        errors: state?.errors, // Pass potential errors from server validation
    });

    useEffect(() => {
        if (state?.message) {
            toast({
                title: state.success ? 'Success!' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });

            // Reset form on successful submission
            if (state.success) {
                form.reset();
                // Optionally reset the form state managed by useFormState
                // This might require adjusting the action or handling state reset differently
                // For now, react-hook-form's reset is sufficient for the UI
            }
        }
    }, [state, toast, form]);

    return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
                    <CardDescription>Have questions? Fill out the form below and we'll get back to you.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* We use formAction from useFormState for submission */}
                    {/* react-hook-form is mainly for client-side validation display */}
                    <form action={formAction} className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                {...form.register('name')}
                                placeholder="Your Name"
                                aria-invalid={form.formState.errors.name ? "true" : "false"}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...form.register('email')}
                                placeholder="your.email@example.com"
                                aria-invalid={form.formState.errors.email ? "true" : "false"}
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        {/* Subject Field */}
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                {...form.register('subject')}
                                placeholder="Regarding..."
                                aria-invalid={form.formState.errors.subject ? "true" : "false"}
                            />
                            {form.formState.errors.subject && (
                                <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
                            )}
                        </div>

                        {/* Message Field */}
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                {...form.register('message')}
                                placeholder="Your message here..."
                                rows={5}
                                aria-invalid={form.formState.errors.message ? "true" : "false"}
                            />
                            {form.formState.errors.message && (
                                <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
                            )}
                        </div>
                        
                        <SubmitButton />

                         {/* Display general form message from server action (non-field specific errors) */}
                         {!state.success && state.message && !form.formState.isValid && (
                            <p className="text-sm text-destructive text-center">{state.message}</p>
                         )}

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
