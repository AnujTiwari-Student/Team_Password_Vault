import mongoose, { Document, Model } from "mongoose";

export type ItemType = 'login' | 'note' | 'totp';

export interface IItem extends Document {
    vault_id: mongoose.Types.ObjectId;
    type: ItemType;
    name: string;
    url: string | null;
    username_ct: string | null;
    password_ct: string | null;
    note_ct: string | null;
    totp_seed_ct: string | null;
    item_key_wrapped: string;
    tags: string[];
    created_by: mongoose.Types.ObjectId;
    updated_at: Date;
}

const ItemSchema = new mongoose.Schema<IItem>({
    vault_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vault',
        required: true,
    },
    type: {
        type: String,
        enum: ['login', 'note', 'totp'],
        required: true,
    },
    name: {
        type: String,
        required: [true, "Item name is required"],
        trim: true,
    },
    url: {
        type: String,
        default: null,
    },
    username_ct: { type: String, default: null, select: false },
    password_ct: { type: String, default: null, select: false },
    note_ct: { type: String, default: null, select: false },
    totp_seed_ct: { type: String, default: null, select: false },
    item_key_wrapped: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: [],
        index: true,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: 'items',
    timestamps: false,
});

const ItemModel: Model<IItem> = mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);

export default ItemModel;
