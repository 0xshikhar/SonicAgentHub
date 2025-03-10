import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { createWallet } from '@/lib/supabase-db'
import { cleanHandle } from '@/lib/strings'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { handle } = req.body

        if (!handle) {
            return res.status(400).json({ error: 'Handle is required' })
        }

        console.log(`[API CREATE WALLET] Creating wallet for handle: ${handle}`)
        
        // Clean the handle
        const cleanedHandle = cleanHandle(handle)
        
        // Generate a new wallet
        const wallet = ethers.Wallet.createRandom()
        console.log(`[API CREATE WALLET] Generated new wallet with address: ${wallet.address}`)
        
        // Create a permit signature (placeholder for now)
        const permitSignature = 'placeholder-permit-signature'
        
        // Save the wallet to the database
        const walletData = await createWallet({
            handle: cleanedHandle,
            address: wallet.address,
            privateKey: wallet.privateKey,
            permitSignature
        })
        
        if (!walletData) {
            console.error(`[API CREATE WALLET] Failed to save wallet for handle: ${cleanedHandle}`)
            return res.status(500).json({ error: 'Failed to save wallet' })
        }
        
        console.log(`[API CREATE WALLET] Successfully created wallet for handle: ${cleanedHandle}`)
        
        // Return the wallet data (excluding private key)
        return res.status(200).json({
            handle: walletData.handle,
            address: walletData.address,
            created_at: walletData.created_at
        })
    } catch (error) {
        console.error('[API CREATE WALLET] Error creating wallet:', error)
        return res.status(500).json({ 
            error: 'Failed to create wallet',
            details: error instanceof Error ? error.message : String(error)
        })
    }
} 