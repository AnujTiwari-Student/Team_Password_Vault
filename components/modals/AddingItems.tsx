import React from 'react'
import { Dialog, DialogDescription, DialogHeader, DialogTrigger, DialogTitle, DialogContent } from '../ui/dialog'
import ItemCreationForm from '../auth/item-creation-form'

function AddingItemsModal() {
    return (
        <Dialog>
            <DialogTrigger className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'>
                Add Items
            </DialogTrigger>
            <DialogContent className='bg-gray-900 border border-gray-700'>
                <DialogHeader>
                    <DialogTitle className='text-white'>Add Items</DialogTitle>
                    <DialogDescription className='text-gray-400'>
                        Add items to your vault to get started
                    </DialogDescription>
                </DialogHeader>
                <ItemCreationForm />
            </DialogContent>
        </Dialog>
    )
}

export default AddingItemsModal