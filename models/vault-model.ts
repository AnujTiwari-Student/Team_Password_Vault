import mongoose, { Document, Model } from "mongoose";

export interface IVault extends Document {
    org_id: mongoose.Types.ObjectId;
    name: string;
    type: 'org' | 'personal';
    ovk_id: mongoose.Types.ObjectId; 
    created_at: Date;
}

const VaultSchema = new mongoose.Schema<IVault>({
    org_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Org',
        required: true,
    },
    name: {
        type: String,
        required: [true, "Vault name is required"],
        trim: true,
    },
    type: {
        type: String,
        enum: ['org', 'personal'],
        required: true,
        default: 'org',
    },
    ovk_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Org', 
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: 'vaults',
    timestamps: false,
});

const VaultModel: Model<IVault> = mongoose.models.Vault || mongoose.model<IVault>("Vault", VaultSchema);

export default VaultModel;
