import mongoose, { Document, Model } from "mongoose";

export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

// Interface for Membership document
export interface IMembership extends Document {
    org_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    role: MemberRole;
    ovk_wrapped_for_user: string;
    created_at: Date;
}

const MembershipSchema = new mongoose.Schema<IMembership>({
    org_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Org',
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'member', 'viewer'],
        required: true,
        default: 'member',
    },  
    ovk_wrapped_for_user: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: 'memberships',
    timestamps: false,
    // index: [{ org_id: 1, user_id: 1 }, { unique: true }],
});

const MembershipModel: Model<IMembership> = mongoose.models.Membership || mongoose.model<IMembership>("Membership", MembershipSchema);

export default MembershipModel;
