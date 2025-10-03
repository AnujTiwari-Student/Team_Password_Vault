import UserModel from "@/models/users-model"



export const getUserByEmail = async (email: string) => {
    return UserModel.findOne({ email }).select('+auth_hash +umk_salt +master_passphrase_verifier');
}

export const getUserById = async (id: string) => {
    return UserModel.findById(id).select('+auth_hash +umk_salt +master_passphrase_verifier');
}

export const updateUserLastLogin = async (id: string) => {
    return UserModel.findByIdAndUpdate(id, { last_login: new Date() });
}

export const updateUserTwoFA = async (id: string, twofa_enabled: boolean) => {
    return UserModel.findByIdAndUpdate(id, { twofa_enabled });
}

export const updateUserPublicKey = async (id: string, public_key: string) => {
    return UserModel.findByIdAndUpdate(id, { public_key });
}

export const updateUserMasterPassphraseVerifier = async (id: string, verifier: string) => {
    return UserModel.findByIdAndUpdate(id, { master_passphrase_verifier: verifier });
}

export const deleteUserById = async (id: string) => {
    return UserModel.findByIdAndDelete(id);
}

export const deleteUserByEmail = async (email: string) => {
    return UserModel.findOneAndDelete({ email });
}

export const getAllUsers = async () => {
    return UserModel.find();
}