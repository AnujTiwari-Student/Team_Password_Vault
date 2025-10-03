

import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
    email: string,
    auth_hash: string,
    auth_provider: string,
    umk_salt: string,
    master_passphrase_verifier: string | null;
    twofa_enabled: boolean;
    public_key: string | null; 
    created_at: Date;
    last_login: Date | null;
}

const UserSchema = new mongoose.Schema({

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
    },

    auth_hash: {
        type: String,
        required: [true, "Authentication hash is required"],
        select: false, 
    },

    auth_provider: {
        type: String,
        required: [true, "Auth provider is required"],
        enum: ['credentials', 'oauth', 'sso'], 
        default: 'credentials',
    },

    umk_salt: {
        type: String,
        required: [true, "UMK salt is required for key derivation"],
        select: false,
    },

    master_passphrase_verifier: {
        type: String,
        default: null,
        select: false, 
    },

    twofa_enabled: {
        type: Boolean,
        default: false,
    },

    public_key: {
        type: String,
        default: null,
    },

    created_at: {
        type: Date,
        default: Date.now,
    },

    last_login: {
        type: Date,
        default: null,
    },

}, {
    collection: 'users',
    timestamps: false,
});

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;