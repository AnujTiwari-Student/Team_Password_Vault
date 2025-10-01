import mongoose, { Document, Model } from "mongoose";

export interface IOrg extends Document {
    name: string;
    owner_user_id: mongoose.Types.ObjectId;
    created_at: Date;
}

const OrgSchema = new mongoose.Schema<IOrg>({
    name: {
        type: String,
        required: [true, "Organization name is required"],
        trim: true,
        maxlength: 128,
    },
    owner_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: 'orgs',
    timestamps: false,
});

const OrgModel: Model<IOrg> = mongoose.models.Org || mongoose.model<IOrg>("Org", OrgSchema);

export default OrgModel;
