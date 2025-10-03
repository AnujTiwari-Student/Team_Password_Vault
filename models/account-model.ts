

import mongoose, { Document, Model } from "mongoose";

export interface IAccount extends Document {
    userId: mongoose.Types.ObjectId;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
    created_at: Date;
    updated_at: Date;
}

const AccountSchema = new mongoose.Schema<IAccount>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    provider: {
        type: String,
        required: [true, "Provider is required"],        
    },
    providerAccountId: {
        type: String,
        required: [true, "Provider Account ID is required"],        
    },
    refresh_token: {
        type: String,
        default: null,
    },
    access_token: {
        type: String,
        default: null,
    },
    expires_at: {
        type: Number,
        default: null,
    },
    token_type: {
        type: String,
        default: null,
    },
    scope: {
        type: String,
        default: null,
    },
    id_token: {
        type: String,
        default: null,
    },
    session_state: {
        type: String,
        default: null,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: 'accounts',
    timestamps: true,
});

const AccountModel: Model<IAccount> = mongoose.models.Account || mongoose.model<IAccount>("Account", AccountSchema);

export default AccountModel;