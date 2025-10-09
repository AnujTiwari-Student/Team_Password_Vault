import React, { useState } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { useForm } from 'react-hook-form'
import { ItemCreationSchema, ItemCreationType } from '@/schema/zod-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import { FormError } from './form-error'
import { FormSuccess } from './form-success'
import {
    generateRandomBytes,
    bufferToBase64,
    wrapKey
} from "@/utils/client-crypto";
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useUserMasterKey } from '@/hooks/useUserMasterKey'
import { useVaultOVK } from '@/hooks/useVaultOvk'
import { Textarea } from '../ui/textarea'


function ItemCreationForm() {

    const user = useCurrentUser();

    const [mnemonic, setMnemonic] = useState<string | null>(null);

    const { umkCryptoKey } = useUserMasterKey(mnemonic || null);

    const ovkCryptoKey = useVaultOVK(
        umkCryptoKey,
        user?.org?.id || user?.id || null,
        user?.vault?.type
    );

    const [isPending, startTransition] = React.useTransition();
    const [success, setSuccess] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const form = useForm<ItemCreationType>({
        resolver: zodResolver(ItemCreationSchema),
        defaultValues: {
            item_name: "",
            item_url: "",
            username_ct: "",
            password_ct: "",
            totp_seed_ct: undefined,
            vaultId: user?.vault?.id,
            item_key_wrapped: "",
            type: "login",
            tags: [],
            notes_ct: "",
            created_by: user?.id
        },
    });

    const onMnemonicChange = (value: string) => {
        form.setValue("mnemonic", value, { shouldValidate: true }); 
        setMnemonic(value); 
    };

    const onSubmit = (data: ItemCreationType) => {

        console.log("Form data:", data);

        setError(null);
        setSuccess(null);

        if (!ovkCryptoKey) {
            setError("Organization vault key not loaded yet.");
            return;
        }

        startTransition(async () => {
            try {

                console.log("Transistion started")

                const itemKeyRaw = new Uint8Array(generateRandomBytes(32));
                const itemKeyBase64 = bufferToBase64(itemKeyRaw);

                const itemKey = await crypto.subtle.importKey(
                    "raw",
                    itemKeyRaw,
                    "AES-GCM",
                    false,
                    ["encrypt"]
                );

                const secretsToEncrypt: { field: string, value: string | undefined }[] = [
                    { field: 'username_ct', value: data.username_ct },
                    { field: 'password_ct', value: data.password_ct },
                    { field: 'totp_seed_ct', value: data.totp_seed_ct },
                    { field: 'notes_ct', value: data.notes_ct },
                ];
                const encryptedFields: Record<string, string> = {};

                for (const secret of secretsToEncrypt) {
                    if (secret.value) {
                        const rawValue = secret.value;
                        const iv = new Uint8Array(generateRandomBytes(12));

                        const buffer = new TextEncoder().encode(rawValue);

                        const ciphertextBuffer = await crypto.subtle.encrypt(
                            { name: "AES-GCM", iv: iv },
                            itemKey,
                            buffer
                        );

                        const ivAndCiphertext = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
                        ivAndCiphertext.set(iv, 0);
                        ivAndCiphertext.set(new Uint8Array(ciphertextBuffer), iv.length);

                        encryptedFields[secret.field] = bufferToBase64(ivAndCiphertext);
                    }
                }

                const itemKeyWrapped = await wrapKey(itemKeyBase64, ovkCryptoKey!);

                const payload = {
                    item_name: data.item_name,
                    item_url: data.item_url,
                    vaultId: data.vaultId,
                    type: data.type,
                    tags: data.tags,
                    item_key_wrapped: itemKeyWrapped,
                    created_by: data.created_by,
                    ...encryptedFields,
                };

                console.log("Payload:", payload);
                console.log("Api endpoint:", '/api/items');
                const response = await fetch('/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to create item on server.");
                }

                setSuccess("Item created and encrypted successfully!");

            } catch (error) {
                const err = error as Error;
                setError(err.message || "An error occurred during item creation.");
            }
        })
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} >
                    <div className='space-y-4'>

                        <FormField
                            control={form.control}
                            name="mnemonic"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Master Passphrase</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={mnemonic || ""}
                                            onChange={(e) => onMnemonicChange(e.target.value)}
                                            placeholder="Your 24 word master passphrase"
                                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="item_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Item Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Name of the item"
                                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="item_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Item Url</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="URL"
                                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="username_ct"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Username"
                                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='type'
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormLabel className="text-white">Item Type</FormLabel>
                                        <FormControl>
                                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full focus:border-blue-500">
                                                <SelectValue placeholder="Vault Type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            <SelectGroup>
                                                <SelectLabel>Item Type</SelectLabel>
                                                <SelectItem value="login" className="text-white hover:bg-gray-700">Login</SelectItem>
                                                <SelectItem value="note" className="text-white hover:bg-gray-700">Notes</SelectItem>
                                                <SelectItem value="totp" className="text-white hover:bg-gray-700">Totp</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.watch("type") === "note" && (
                            <FormField
                                control={form.control}
                                name="notes_ct"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Note</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Note"
                                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {form.watch("type") === "totp" && (
                            <FormField
                                control={form.control}
                                name="totp_seed_ct"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Totp Secret</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="text"
                                                placeholder="Totp Secret"
                                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {form.watch("type") === "login" && (
                            <FormField
                                control={form.control}
                                name="password_ct"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="text"
                                                placeholder="Password"
                                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Tags</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Tags"
                                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </div>
                    {Object.keys(form.formState.errors).length > 0 && (
                        <pre className="text-red-500">
                            {JSON.stringify(form.formState.errors, null, 2)}
                        </pre>
                    )}
                    <div className='w-full mt-4'>
                        <FormError message={error} />
                        <FormSuccess message={success} />
                    </div>
                    <Button
                        type='submit'
                        className={`w-full bg-blue-600 mt-4 hover:bg-blue-700 text-white ${isPending ? "cursor-not-allowed" : ""}`}
                        disabled={isPending || !ovkCryptoKey}
                    >
                        {isPending ? "Adding..." : "Add item to vault"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default ItemCreationForm