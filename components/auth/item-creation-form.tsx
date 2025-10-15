import React, { useState, useCallback } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { useForm } from 'react-hook-form'
import { ItemCreationSchema, ItemCreationType, ItemTypeEnum, ITEM_TYPES } from '@/schema/zod-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { FormError } from './form-error'
import { FormSuccess } from './form-success'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { X, Plus, Shield, Lock, FileText, ExternalLink, User } from 'lucide-react'
import {
    generateRandomBytes,
    bufferToBase64,
    wrapKey
} from "@/utils/client-crypto";
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useUserMasterKey } from '@/hooks/useUserMasterKey'
import { useVaultOVK } from '@/hooks/useVaultOvk'

interface ItemTypeConfig {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    color: string;
    examples: string[];
}

const ITEM_TYPE_CONFIG: Record<ItemTypeEnum, ItemTypeConfig> = {
    login: {
        label: 'Login Credentials',
        icon: Lock,
        description: 'Store usernames, passwords, and login URLs',
        color: 'bg-blue-900/20 text-blue-300 border-blue-700/50',
        examples: ['Username + Password', 'Email + Password + URL']
    },
    note: {
        label: 'Secure Note',
        icon: FileText,
        description: 'Store sensitive text with optional context',
        color: 'bg-purple-900/20 text-purple-300 border-purple-700/50',
        examples: ['Recovery codes + Username', 'Server details + Login info']
    },
    totp: {
        label: 'Two-Factor Auth',
        icon: Shield,
        description: 'Store 2FA keys with context information',
        color: 'bg-green-900/20 text-green-300 border-green-700/50',
        examples: ['TOTP + Username', 'TOTP + URL + Account info']
    }
};

function ItemCreationForm() {
    const user = useCurrentUser();
    const [mnemonic, setMnemonic] = useState<string>('');
    const [tagInput, setTagInput] = useState<string>('');
    const [selectedTypes, setSelectedTypes] = useState<ItemTypeEnum[]>([]);
    const [tags, setTags] = useState<string[]>([]);

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
            mnemonic: "",
            item_name: "",
            item_url: "",
            username_ct: "",
            password_ct: "",
            totp_seed_ct: "",
            vaultId: user?.vault?.id || "",
            item_key_wrapped: "",
            type: [],
            tags: [],
            notes_ct: "",
            created_by: user?.id || ""
        },
    });

    const toggleItemType = useCallback((type: ItemTypeEnum) => {
        const newTypes = selectedTypes.includes(type)
            ? selectedTypes.filter(t => t !== type)
            : [...selectedTypes, type];
        
        setSelectedTypes(newTypes);
        form.setValue('type', newTypes);
    }, [selectedTypes, form]);

    const addTag = useCallback(() => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            const newTags = [...tags, tagInput.trim()];
            setTags(newTags);
            form.setValue('tags', newTags);
            setTagInput('');
        }
    }, [tagInput, tags, form]);

    const removeTag = useCallback((tagToRemove: string) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        form.setValue('tags', newTags);
    }, [tags, form]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    }, [addTag]);

    const onSubmit = useCallback((data: ItemCreationType) => {
        setError(null);
        setSuccess(null);

        if (!ovkCryptoKey) {
            setError("Organization vault key not loaded yet.");
            return;
        }

        startTransition(async () => {
            try {
                const itemKeyRaw = new Uint8Array(generateRandomBytes(32));
                const itemKeyBase64 = bufferToBase64(itemKeyRaw);

                const itemKey = await crypto.subtle.importKey(
                    "raw",
                    itemKeyRaw,
                    "AES-GCM",
                    false,
                    ["encrypt"]
                );

                const secretsToEncrypt: Array<{ field: string; value: string | undefined }> = [
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

                const itemKeyWrapped = await wrapKey(itemKeyBase64, ovkCryptoKey);

                const payload = {
                    item_name: data.item_name,
                    item_url: data.item_url,
                    vaultId: data.vaultId,
                    type: selectedTypes,
                    tags: tags,
                    item_key_wrapped: itemKeyWrapped,
                    created_by: data.created_by,
                    ...encryptedFields,
                };

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
                form.reset();
                setMnemonic('');
                setTagInput('');
                setSelectedTypes([]);
                setTags([]);

            } catch (error) {
                const err = error as Error;
                setError(err.message || "An error occurred during item creation.");
            }
        })
    }, [ovkCryptoKey, form, selectedTypes, tags]);

    const needsURL = selectedTypes.includes('login') || selectedTypes.includes('totp');
    const needsUsername = selectedTypes.length > 0; 
    const needsPassword = selectedTypes.includes('login');
    const needsTOTP = selectedTypes.includes('totp');
    const needsNote = selectedTypes.includes('note');
    const hasMultipleTypes = selectedTypes.length > 1;

    return (
        <div className="flex flex-col h-full max-h-[65vh]">
            <div className="flex-shrink-0 px-1 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Create Vault Item</h2>
                <p className="text-gray-400 text-sm">Store your passwords, notes, and 2FA keys securely - mix and match as needed</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 minimal-scrollbar">
                <div className="space-y-4 sm:space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                            
                            <FormField
                                control={form.control}
                                name="mnemonic"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="text-white">Master Passphrase</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                value={mnemonic}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setMnemonic(value);
                                                    form.setValue('mnemonic', value);
                                                }}
                                                placeholder="Your 24 word master passphrase"
                                                rows={3}
                                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 font-mono text-sm resize-none"
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
                                                placeholder="e.g., GitHub Account, Bank 2FA + Recovery, Server Access Notes"
                                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <FormLabel className="text-white">What do you want to store?</FormLabel>
                                    <p className="text-gray-400 text-sm mt-1">Select one or more types - you can combine them freely</p>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    {ITEM_TYPES.map((type) => {
                                        const config = ITEM_TYPE_CONFIG[type];
                                        const Icon = config.icon;
                                        const isSelected = selectedTypes.includes(type);
                                        
                                        return (
                                            <div
                                                key={type}
                                                onClick={() => toggleItemType(type)}
                                                className={`
                                                    relative p-3 sm:p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.01]
                                                    ${isSelected
                                                        ? `${config.color} border-current`
                                                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-4 h-4 border-2 rounded flex items-center justify-center mt-0.5 ${
                                                        isSelected 
                                                            ? 'bg-blue-600 border-blue-600' 
                                                            : 'border-gray-400 bg-transparent'
                                                    }`}>
                                                        {isSelected && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-white text-sm mb-1">{config.label}</h3>
                                                        <p className="text-gray-400 text-xs mb-2">{config.description}</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {config.examples.map((example, idx) => (
                                                                <span key={idx} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded">
                                                                    {example}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {selectedTypes.length === 0 && (
                                    <p className="text-red-400 text-sm">Please select at least one item type</p>
                                )}
                            </div>

                            {/* Combined Information Section */}
                            {selectedTypes.length > 0 && (
                                <div className="space-y-4 p-3 sm:p-4 bg-gray-800/30 rounded-lg border border-gray-600/50">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex -space-x-1">
                                            {selectedTypes.map((type) => {
                                                const Icon = ITEM_TYPE_CONFIG[type].icon;
                                                return (
                                                    <div key={type} className={`w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs ${
                                                        type === 'login' ? 'bg-blue-600' :
                                                        type === 'totp' ? 'bg-green-600' : 'bg-purple-600'
                                                    }`}>
                                                        <Icon className="w-3 h-3 text-white" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <h3 className="text-white font-semibold text-sm sm:text-base">
                                            {hasMultipleTypes ? 'Combined Item Information' : `${ITEM_TYPE_CONFIG[selectedTypes[0]].label} Information`}
                                        </h3>
                                    </div>

                                    {needsURL && (
                                        <FormField
                                            control={form.control}
                                            name="item_url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white text-sm flex items-center gap-2">
                                                        <ExternalLink className="w-4 h-4" />
                                                        Website URL
                                                        {selectedTypes.includes('login') && selectedTypes.includes('totp') && (
                                                            <span className="text-xs text-gray-400">(shared for login & 2FA)</span>
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="text"
                                                            placeholder="https://example.com"
                                                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {needsUsername && (
                                        <FormField
                                            control={form.control}
                                            name="username_ct"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white text-sm flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        Username/Email/Account
                                                        {hasMultipleTypes && (
                                                            <span className="text-xs text-gray-400">(shared across all types)</span>
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="text"
                                                            placeholder="username, email@example.com, or account identifier"
                                                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {needsPassword && (
                                        <FormField
                                            control={form.control}
                                            name="password_ct"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white text-sm flex items-center gap-2">
                                                        <Lock className="w-4 h-4" />
                                                        Password
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="password"
                                                            placeholder="Enter password"
                                                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {needsTOTP && (
                                        <FormField
                                            control={form.control}
                                            name="totp_seed_ct"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white text-sm flex items-center gap-2">
                                                        <Shield className="w-4 h-4" />
                                                        2FA Secret Key
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="text"
                                                            placeholder="Enter TOTP secret key"
                                                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 font-mono text-sm"
                                                        />
                                                    </FormControl>
                                                    <p className="text-gray-400 text-xs">The secret key provided when setting up 2FA</p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {needsNote && (
                                        <FormField
                                            control={form.control}
                                            name="notes_ct"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white text-sm flex items-center gap-2">
                                                        <FileText className="w-4 h-4" />
                                                        Secure Note
                                                        {hasMultipleTypes && (
                                                            <span className="text-xs text-gray-400">(additional context/recovery info)</span>
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="Recovery codes, backup information, additional context..."
                                                            rows={4}
                                                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 resize-none text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                            )}

                            <div className="space-y-3">
                                <FormLabel className="text-white text-sm">Tags</FormLabel>
                                <div className="flex gap-2">
                                    <Input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Add a tag..."
                                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 text-sm flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addTag}
                                        variant="outline"
                                        size="icon"
                                        className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white flex-shrink-0 h-10 w-10"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="bg-gray-700 text-gray-200 hover:bg-gray-600 pr-1 text-xs"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="ml-2 hover:text-red-400 rounded-full p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className='w-full'>
                                <FormError message={error} />
                                <FormSuccess message={success} />
                            </div>
                            
                        </form>
                    </Form>
                </div>
            </div>

            <div className="flex-shrink-0 pt-4 border-t border-gray-700/50 mt-4">
                <Button
                    type='submit'
                    onClick={form.handleSubmit(onSubmit)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-10 sm:h-11 text-sm sm:text-base"
                    disabled={isPending || !ovkCryptoKey || selectedTypes.length === 0}
                >
                    {isPending ? "Creating..." : "Create Vault Item"}
                </Button>
            </div>
        </div>
    )
}

export default ItemCreationForm
