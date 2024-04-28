'use server';
import { NextRequest, NextResponse } from 'next/server';
import {
  verifySignature,
  VerifySignatureParams,
  createAuth,
  VerifyLoginPayloadParams,
} from 'thirdweb/auth';
import { privateKeyToAccount } from 'thirdweb/wallets';
import { cookies } from 'next/headers';
import { client } from '../../../lib/sdk/thirdweb/client';

const privateKey = process.env.THIRDWEB_ADMIN_PRIVATE_KEY || '';

if (!privateKey) {
  throw new Error('Missing THIRDWEB_ADMIN_PRIVATE_KEY in .env file.');
}

const thirdwebAuth = createAuth({
  domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || '',
  adminAccount: privateKeyToAccount({ client, privateKey }),
});

export const generateAPayload = thirdwebAuth.generatePayload;

export async function login(payload: VerifyLoginPayloadParams) {
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
  if (verifiedPayload.valid) {
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    });
    cookies().set('jwt', jwt);
  }
}

export async function isLoggedIn() {
  const jwt = cookies().get('jwt');
  if (!jwt?.value) {
    return false;
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
  if (!authResult.valid) {
    return false;
  }
  return true;
}

export async function logout() {
  cookies().delete('jwt');
}

/** Required query parameters:

    redirect_uri: the URL toward which the user is redirected once they have connected their wallet and signed the message to authenticate them
    client_id : a string to identify your application. It MUST match the "host" part of the redirect_uri.

Optional query parameters:

    paywallConfig : a JSON object built using the same structure in purchase URLs. You can customize the messageToSign and icon elements in particular.
*/

// Making a call to the Unlock App Checkout endpoint
const unlock_siwe: URL = new URL('https://app.unlock-protocol.com/checkout');

// You can set a specific redirect URL or grab the current location in your app
const redirect_url: URL = new URL('https://creativeplatform.xyz/');

// Client Id - ensure this is correctly assigned as expected by Unlock Protocol
const client_id: string = 'creativeplatform.xyz';

// Add the parameters
unlock_siwe.searchParams.append('client_id', client_id);
unlock_siwe.searchParams.append('redirect_uri', redirect_url.toString()); // Convert redirect_url to a string

// Generate your SIWE (Sign-In with Ethereum) link
console.log(unlock_siwe.toString());

/** Redirects

If the user refuses to connect and/or sign a message in their wallet, they will be redirected back to the redirect_uri and a new query string parameter will be attached ?error=access-denied.

If the user connected their wallet and signed the messages, they will also be redirected to your application, this time with a code extra query parameter. The value of this parameter is base64 encoded and can be decoded by your application in order to retrieve the signature message along with the message that was signed. Using these 2 values, you can "recover" the address of the signer.

Most Ethereum libraries include a function to compute the signer's address from a message and the corresponding signature 
*/
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Check for error or code in the query parameters
  const error = searchParams.get('error');
  const code = searchParams.get('code');
  const address = searchParams.get('address'); // Assuming address is passed as a query parameter

  if (error) {
    console.log('Error:', error);
    return new NextResponse('User refused to sign the message', {
      status: 400,
    });
  } else if (code && address) {
    try {
      const decoded = JSON.parse(atob(code));
      const verifyParams: VerifySignatureParams = {
        message: decoded.d, // the signed message
        signature: decoded.s, // the signature
        address: address, // user's Ethereum address
      };

      // Assuming verifySignature is a promise-based function
      const verifiedAddress = await verifySignature(verifyParams);
      console.log('Recovered address:', verifiedAddress);
      return new NextResponse(`Address verified: ${verifiedAddress}`);
    } catch (error) {
      console.log('Failed to verify signature:', error);
      return new NextResponse('Failed to process the signature', {
        status: 500,
      });
    }
  } else {
    return new NextResponse('No valid query parameters provided', {
      status: 400,
    });
  }
}