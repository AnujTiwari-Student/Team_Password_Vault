import mongoose, { Document, Model } from "mongoose";
import { MemberRole } from "./membership-model";

// ===================================
// SHARE MODEL
// ===================================

const PermsSchema = new mongoose.Schema({
    view: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    share: { type: Boolean, default: false },
    manage: { type: Boolean, default: false },
}, { _id: false });

export interface IShare extends Document {
    target_type: 'vault' | 'item';
    target_id: mongoose.Types.ObjectId;
    grantee_type: 'user' | 'role';
    grantee_id: mongoose.Types.ObjectId | null; // Used if grantee_type is 'user'
    role: string | null; // Used if grantee_type is 'role'
    perms: {
        view: boolean;
        edit: boolean;
        share: boolean;
        manage: boolean;
    };
    created_at: Date;
}

const ShareSchema = new mongoose.Schema<IShare>({
    target_type: {
        type: String,
        enum: ['vault', 'item'],
        required: true,
    },
    target_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Can reference Vault or Item, depending on target_type
    },
    grantee_type: {
        type: String,
        enum: ['user', 'role'],
        required: true,
    },
    // Store user ID if sharing to a specific user
    grantee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    // Store role string if sharing to all members of a specific role (e.g., 'admin', 'member')
    role: {
        type: String,
        default: null,
    },
    perms: {
        type: PermsSchema,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: 'shares',
    timestamps: false,
});

// ===================================
// AUDIT MODEL
// ===================================

export interface IAudit extends Document {
    org_id: mongoose.Types.ObjectId;
    actor_user_id: mongoose.Types.ObjectId;
    action: string; // e.g., 'item_created', 'password_revealed', 'user_invited'
    subject_type: 'org' | 'vault' | 'item' | 'member' | 'invite';
    subject_id: mongoose.Types.ObjectId | null;
    ip: string | null;
    ua: string | null; // User-Agent string
    ts: Date; // Timestamp (using 'ts' as per scope)
    meta: Record<string, unknown>; 
}

const AuditSchema = new mongoose.Schema<IAudit>({
    org_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Org',
        required: true,
        index: true,
    },
    actor_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    subject_type: {
        type: String,
        required: true,
        enum: ['org', 'vault', 'item', 'member', 'invite'],
    },
    subject_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        // This ID refers to the specific item, vault, user, etc., that the action was performed on.
    },
    ip: {
        type: String,
        default: null,
    },
    ua: {
        type: String,
        default: null,
        maxlength: 512,
    },
    ts: {
        type: Date,
        default: Date.now,
        required: true,
        index: true, // Indexing on timestamp is important for filtering audit logs
    },
    meta: {
        type: mongoose.Schema.Types.Mixed, // Allows for flexible data structure
        default: {},
    },
}, {
    collection: 'audits',
    timestamps: false,
});

// ===================================
// INVITE MODEL
// ===================================

export interface IInvite extends Document {
    org_id: mongoose.Types.ObjectId;
    email: string;
    role: MemberRole; // Using the same roles as IMembership
    token: string;
    expires_at: Date;
    invited_by: mongoose.Types.ObjectId;
}

const InviteSchema = new mongoose.Schema<IInvite>({
    org_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Org',
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'member', 'viewer'],
        required: true,
        default: 'member',
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expires_at: {
        type: Date,
        required: true,
        index: { expires: 0 }, // MongoDB TTL index to automatically delete expired invites
    },
    invited_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    collection: 'invites',
    timestamps: false,
});

// Exporting all models from this file
const ShareModel: Model<IShare> = mongoose.models.Share || mongoose.model<IShare>("Share", ShareSchema);
const AuditModel: Model<IAudit> = mongoose.models.Audit || mongoose.model<IAudit>("Audit", AuditSchema);
const InviteModel: Model<IInvite> = mongoose.models.Invite || mongoose.model<IInvite>("Invite", InviteSchema);

// Re-exporting for easy import
export { ShareModel, AuditModel, InviteModel };
